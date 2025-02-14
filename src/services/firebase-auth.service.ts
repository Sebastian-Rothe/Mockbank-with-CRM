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
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  // Observable for user data
  user$: Observable<any | null>;
  // BehaviorSubject for UID; allows .next() to update the value
  uid$: BehaviorSubject<string | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private firebaseService: FirebaseService,
    private accountService: AccountService,
    private router: Router
  ) {
    // Initialize BehaviorSubject with null
    this.uid$ = new BehaviorSubject<string | null>(null);

    // Listen to authentication state changes and update UID accordingly
    onAuthStateChanged(this.auth, (user) => {
      this.uid$.next(user?.uid || null);
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
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
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
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      this.uid$.next(userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logs in as a guest user.
   *
   * @returns A promise that resolves to the guest user credential.
   */
  async guestLogin(): Promise<UserCredential | null> {
    try {
      const userCredential = await signInAnonymously(this.auth);
      await this.ensureGuestUserExists(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('Error during guest login:', error);
      throw error;
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
   * Logs out the current user.
   *
   * If the current user is a guest, cleans up guest data before logging out.
   *
   * @returns A promise that resolves when the logout process is complete.
   */
  async logout(): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser && currentUser.isAnonymous) {
        await this.cleanupGuestUserData(currentUser.uid);
      }
      await signOut(this.auth);
      this.uid$.next(null);
      await this.redirectAfterLogout();
    } catch (error) {
      console.error('Error during logout:', error);
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
    const userDocRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData['accounts']) {
        for (const accountId of userData['accounts']) {
          await this.accountService.deleteAccount(accountId);
        }
        console.log('All guest accounts have been deleted.');
      }
      await deleteDoc(userDocRef);
      console.log('Guest user data has been deleted.');
    }
  }

  /**
   * Redirects the user after logout.
   *
   * Navigates to the root path and reloads the window.
   *
   * @returns A promise that resolves when the redirection is complete.
   */
  async redirectAfterLogout(): Promise<void> {
    await this.router.navigate(['/']);
    window.location.reload();
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
      console.log('User successfully re-authenticated.');

      // Update email in Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userDocRef, { email: newEmail });
      console.log('Email successfully updated in Firestore.');

      // Update the authentication email and log out
      await updateEmail(user, newEmail);
      await this.logout();
      console.log('Email successfully updated.');
    } catch (error) {
      console.error('Error updating email:', error);
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
      console.log('Password successfully updated.');
    } catch (error) {
      console.error('Error updating password:', error);
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
      console.log('User successfully re-authenticated.');
    } catch (error) {
      console.error('Error during re-authentication:', error);
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
      console.log('Verification email has been sent.');
      console.log('Verification email sent to:', user.email);
    } catch (error) {
      console.error('Error sending verification email:', error);
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

    // Reload user information
    await user.reload();
    return user.emailVerified;
  }
}
