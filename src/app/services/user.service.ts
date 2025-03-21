import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore,
  DocumentReference,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  deleteDoc,
  collectionData,
} from '@angular/fire/firestore';
// Models
import { User } from '../models/user.class';
import { FirebaseAuthService } from './firebase-auth.service';
import { SnackbarService } from './snackbar.service';
import { DialogService } from './dialog.service';
import { LoadingService } from './loading.service';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore: Firestore = inject(Firestore);

  private userCollection = collection(this.firestore, 'users');

  constructor(
    private authService: FirebaseAuthService,
    private snackbarService: SnackbarService,
    private dialogService: DialogService,
    private loadingService: LoadingService
  ) {}

  getUsers(): Observable<User[]> {
    return collectionData(this.userCollection, { idField: 'id' }) as Observable<User[]>;
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(this.userCollection);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return new User({ ...data, uid: doc.id }); // User-Klasse instanziieren und die ID hinzufügen
    });
  }

  async addUserWithAccount(user: User): Promise<void> {
    try {
      const userData = this.cleanUserData(user);
      if (!user.uid) {
        throw new Error('User ID is undefined');
      }
      const userDocRef = await this.createUserDoc(user.uid, userData);
      const accountId = await this.createAccountDoc(user);
      await this.updateUserAccounts(userDocRef, accountId);
    } catch (error) {
      console.error('Error creating user and account:', error);
      throw error;
    }
  }

  cleanUserData(user: User): any {
    const data = user.toPlainObject();
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) delete data[key];
    });
    return data;
  }

  async createUserDoc(uid: string, data: any): Promise<DocumentReference> {
    const userDocRef = doc(this.userCollection, uid);
    await setDoc(userDocRef, { ...data, accounts: [] });
    return userDocRef;
  }

  async createAccountDoc(user: User): Promise<string> {
    const accountId = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const accountData = {
      accountId,
      userId: user.uid,
      fullname: `${user.firstName} ${user.lastName}`,
      balance: 1000,
      currency: 'EUR',
      createdAt: Date.now(),
    };
    const accountDocRef = doc(collection(this.firestore, 'accounts'), accountId);
    await setDoc(accountDocRef, accountData);
    return accountId;
  }

  async updateUserAccounts(userDocRef: DocumentReference, accountId: string): Promise<void> {
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const accounts = userData['accounts'] || [];
      accounts.push(accountId);
      await updateDoc(userDocRef, { accounts });
    } else {
      console.error(`User document not found for ID: ${userDocRef.id}`);
      throw new Error('User document not found');
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        this.dialogService.openDialog('Error', 'No such user!', 'error'); // msg
        return null;
      }

      return this.createUserFromSnapshot(userDocSnap);
    } catch (error) {
      this.dialogService.openDialog('Error', 'Error getting user.', 'error'); // msg
      return null;
    }
  }

  private createUserFromSnapshot(userDocSnap: any): User {
    const userData = userDocSnap.data();
    const user = new User(userData);
    user.uid = userDocSnap.id;
    return user;
  }

  async updateUserProfilePicture(userId: string, profilePictureUrl: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      await updateDoc(userDocRef, { profilePictureUrl });
      this.snackbarService.success('Profile picture updated successfully!'); // snack
    } catch (error) {
      this.dialogService.openDialog('Error', 'Error updating profile picture.', 'error'); // msg
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const currentUserUid = this.authService.getUid();
      if (currentUserUid === userId) {
        this.dialogService.openDialog('Error', 'The logged-in user cannot be deleted.', 'error'); // msg
        return false;
      }

      if (!this.authService.canDeleteUser()) {
        this.dialogService.openDialog('Error', 'Maximum number of deletions reached.', 'error'); // msg
        return false;
      }

      const userDocRef = doc(this.firestore, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        this.dialogService.openDialog('Error', 'User not found.', 'error'); // msg
        return false;
      }

      const userData = userSnap.data();
      if (userData['role'] === 'admin') {
        this.dialogService.openDialog('Error', 'Admins cannot be deleted.', 'error'); // msg
        return false;
      }

      await deleteDoc(userDocRef);
      this.authService.incrementDeletedUsersCount();
      this.snackbarService.success('User deleted successfully!');
      return true;
    } catch (error) {
      throw error;
    } finally {
      this.loadingService.hide(); // Ensure loading spinner is hidden
    }
  }
}
