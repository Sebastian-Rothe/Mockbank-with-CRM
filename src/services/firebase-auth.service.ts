import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  sendEmailVerification,
  sendPasswordResetEmail,
  UserCredential,
  signInAnonymously,
} from '@angular/fire/auth';
import { Observable, BehaviorSubject, of, switchMap } from 'rxjs';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Firestore,
  doc,
  updateDoc,
  docData,
  getDoc,
  setDoc,
  deleteDoc,
} from '@angular/fire/firestore';

import { Router } from '@angular/router';
import { AccountService } from './account.service';
import { SnackbarService } from './snackbar.service';
import { DialogService } from './dialog.service';
import { LoadingService } from './loading.service'; // Import LoadingService

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  // Observable for user data
  user$: Observable<any | null>;
  // BehaviorSubject for UID; allows .next() to update the value
  uid$: BehaviorSubject<string | null>;
  private deletedUsersCount: number = 0;
  private maxDeletions: number = 0;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private accountService: AccountService,
    private snackbarService: SnackbarService,
    private dialogService: DialogService,
    private router: Router,
    private loadingService: LoadingService // Inject LoadingService
  ) {
    // Initialize BehaviorSubject with null
    this.uid$ = new BehaviorSubject<string | null>(null);

    // Listen to authentication state changes and update UID accordingly
    onAuthStateChanged(this.auth, (user) => {
      this.uid$.next(user?.uid || null);
      this.maxDeletions = this.isGuestUser() ? 2 : 3;
    });

    // Map UID to Firestore user document data if available, else emit null
    this.user$ = this.uid$.pipe(
      switchMap((uid) =>
        uid ? docData(doc(this.firestore, 'users', uid)) : of(null)
      )
    );
  }

  /**
   * Registers a new user.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the registered user.
   */
  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      this.uid$.next(userCredential.user.uid);
      this.snackbarService.success('Registration successful!');

      return userCredential.user;
    } catch (error) {
      this.dialogService.openDialog('Error', 'Registration failed: ' + (error as Error).message); // msg
      throw error;
    }
  }

  /**
   * Logs in a user.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to the logged-in user.
   */
  async login(email: string, password: string): Promise<User> {
    try {
      this.loadingService.show(); // Show loading spinner
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add a 1-second delay
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      this.uid$.next(userCredential.user.uid);
      this.snackbarService.success('Login successful!');
      return userCredential.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.dialogService.openDialog('Error', 'Login failed: ' + errorMessage); // msg
      throw error;
    } finally {
      this.loadingService.hide(); // Hide loading spinner
    }
  }

  /**
   * Logs in as a guest user.
   *
   * @returns A promise that resolves to the guest user credential.
   */
  async guestLogin(): Promise<UserCredential | null> {
    try {
      this.loadingService.show(); // Show loading spinner
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add a 1-second delay
      const userCredential = await signInAnonymously(this.auth);
      await this.ensureGuestUserExists(userCredential.user.uid);
      this.snackbarService.success('Guest login successful!');
      return userCredential;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.dialogService.openDialog('Error', 'Guest login failed: ' + errorMessage); // msg
      throw error;
    } finally {
      this.loadingService.hide(); // Hide loading spinner
    }
  }

  /**
   * Ensures that a guest user exists in Firestore.
   *
   * If the guest user document does not exist, it creates one with default guest data.
   *
   * @param uid - The user ID of the guest user.
   * @returns A promise that resolves when the operation is complete.
   */
  async ensureGuestUserExists(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    if (!userSnapshot.exists()) {
      const guestUser = {
        uid,
        firstName: 'Guest',
        lastName: 'User',
        email: 'guest@temporary.com',
        role: 'guest',
        createdAt: Date.now(),
      };
      await setDoc(userDocRef, guestUser);
    }
  }

  /**
   * Checks if the current user is a guest (anonymous user).
   *
   * @returns A boolean indicating whether the user is a guest.
   */
  isGuestUser(): boolean {
    return this.auth.currentUser?.isAnonymous ?? false;
  }

  /**
   * Logs out the current user.
   *
   * If the current user is a guest, cleans up guest data before logging out.
   *
   * @returns A promise that resolves when the logout process is complete.
   */
  async logout(): Promise<void> {
    try {
      this.loadingService.show(); // Show loading spinner
      const currentUser = this.auth.currentUser;
      if (currentUser && currentUser.isAnonymous) {
        await this.cleanupGuestUserData(currentUser.uid);
      }
      await signOut(this.auth);
      this.uid$.next(null);
      this.snackbarService.success('Logged out successfully!');
      await this.redirectAfterLogout();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.dialogService.openDialog('Error', 'Logout failed: ' + errorMessage); 
      throw error;
    }
  }

  /**
   * Cleans up guest user data from Firestore.
   *
   * Deletes all associated guest accounts and removes the guest user document.
   *
   * @param uid - The user ID of the guest user.
   * @returns A promise that resolves when the cleanup is complete.
   */
  async cleanupGuestUserData(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (Array.isArray(userData['accounts'])) {
          for (const accountId of userData['accounts']) {
            await this.accountService.deleteAccount(accountId);
          }
        }
        await deleteDoc(userDocRef);
        this.snackbarService.success('Guest user data has been deleted.'); 
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.dialogService.openDialog('Error cleaning up guest user data:', errorMessage); 
      throw error;
    }
  }

  /**
   * Redirects the user after logout.
   *
   * Navigates to the root path and reloads the window after a delay to show the snackbar.
   *
   * @returns A promise that resolves when the redirection is complete.
   */
  async redirectAfterLogout(): Promise<void> {
    try {
      await this.router.navigate(['/']);
      setTimeout(() => {
        window.location.reload();
        this.loadingService.hide(); // Hide loading spinner after reload
      }, 1500); // Adjust delay as needed
    } catch (error) {
      this.loadingService.hide(); // Ensure spinner is hidden in case of error
      throw error;
    }
  }

  /**
   * Retrieves the current user UID synchronously.
   *
   * @returns The current user's UID, or null if no user is logged in.
   */
  getUid(): string | null {
    return this.uid$.getValue();
  }

  /**
   * Updates the email address of the current user.
   *
   * Re-authenticates the user with their password, updates the email in Firestore,
   * then updates the authentication email and logs out.
   *
   * @param newEmail - The new email address.
   * @param password - The user's current password for re-authentication.
   * @returns A promise that resolves when the email update process is complete.
   */
  async updateEmail(newEmail: string, password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is logged in.');
    }

    try {
      // Re-authenticate the user first
      await this.reauthenticate(password);

      // Update email in Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userDocRef, { email: newEmail });
      this.snackbarService.success('Email successfully updated in Firestore.');

      // Update the authentication email and log out
      await updateEmail(user, newEmail);
      await this.logout();
      this.snackbarService.success('Email updated successfully. Please log in again.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.dialogService.openDialog('Error', 'Error updating email: ' + errorMessage); // msg
      throw error;
    }
  }

  /**
   * Updates the password of the current user.
   *
   * @param newPassword - The new password.
   * @returns A promise that resolves when the password update is complete.
   */
  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is logged in.');
    }

    try {
      await updatePassword(user, newPassword);
      this.snackbarService.success('Password updated successfully.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.dialogService.openDialog('Error', 'Failed to update password: ' + errorMessage); // msg
      throw error;
    }
  }

  /**
   * Re-authenticates the current user.
   *
   * This is typically used before making sensitive changes.
   *
   * @param password - The current user's password.
   * @returns A promise that resolves when re-authentication is complete.
   */
  async reauthenticate(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user or email address found.');
    }

    const credential = EmailAuthProvider.credential(user.email, password);

    try {
      await reauthenticateWithCredential(user, credential);
      this.snackbarService.success('User successfully re-authenticated.');
    } catch (error) {
   
      this.dialogService.openDialog('Error', 'Error during re-authentication: ' + error); // msg
      throw error;
    }
  }

  /**
   * Sends an email verification to the currently logged-in user.
   *
   * @returns A promise that resolves when the verification email has been sent.
   */
  async sendEmailVerification(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is logged in.');
    }

    try {
      await sendEmailVerification(user);
      this.snackbarService.success('Verification email sent successfully.');
      console.log('Verification email sent to:', user.email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.dialogService.openDialog('Error', 'Failed to send verification email: ' + errorMessage); // msg
      throw error;
    }
  }

  /**
   * Checks whether the currently logged-in user's email is verified.
   *
   * @returns A promise that resolves to a boolean indicating if the email is verified.
   */
  async checkEmailVerification(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No user is logged in.');
    }
    await user.reload();
    return user.emailVerified;
  }

  canDeleteUser(): boolean {
    return this.deletedUsersCount < this.maxDeletions;
  }

  incrementDeletedUsersCount(): void {
    this.deletedUsersCount++;
    const userType = this.isGuestUser() ? 'Guest' : 'User';
    this.snackbarService.success(`${userType} ${this.deletedUsersCount} of ${this.maxDeletions} possible users deleted`); // snackbar
  }
}
