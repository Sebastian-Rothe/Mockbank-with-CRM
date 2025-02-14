import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  DocumentReference,
  DocumentData,
  collection,
  query,
  where,
  collectionData,
  addDoc,
  arrayRemove,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  increment
} from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  firestore: Firestore = inject(Firestore);

  private userCollection = collection(this.firestore, 'users');
  private accountCollection = collection(this.firestore, 'accounts');

  constructor() { }
  async getAccount(accountId: string): Promise<any> {
    try {
      // Zugriff auf das Account-Dokument in der "accounts"-Sammlung
      const accountDocRef = doc(this.firestore, 'accounts', accountId);
      const accountSnap = await getDoc(accountDocRef);

      if (accountSnap.exists()) {
        return accountSnap.data();
      } else {
        throw new Error('Account not found');
      }
    } catch (error) {
      console.error('Error getting account:', error);
      throw error;
    }
  }

  async addAccount(
    userId: string,
    accountDetails: { accountName: string; balance: number; currency: string }
  ): Promise<void> {
    try {
      const accountId = `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const accountData = {
        accountId,
        userId,
        accountName: accountDetails.accountName,
        balance: accountDetails.balance,
        currency: accountDetails.currency,
        createdAt: Date.now(),
      };

      // Account in Firestore hinzufügen
      const accountDocRef = doc(this.accountCollection, accountId);
      await setDoc(accountDocRef, accountData);

      // Account-ID zum Benutzer-Dokument hinzufügen
      const userDocRef = doc(this.firestore, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const accounts = userData['accounts'] || [];
        accounts.push(accountId);
        await updateDoc(userDocRef, { accounts });
      } else {
        throw new Error('User not found.');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  }

  async updateAccount(accountId: string, accountData: any): Promise<void> {
    try {
      const accountDocRef = doc(this.firestore, 'accounts', accountId);
      await updateDoc(accountDocRef, accountData);
      console.log('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async deleteAccount(accountId: string): Promise<void> {
    try {
      const accountDocRef = doc(this.firestore, 'accounts', accountId);
      await deleteDoc(accountDocRef);
      console.log('Account successfully deleted');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
  async removeAccountFromUser(
    userId: string,
    accountId: string
  ): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', userId);
      await updateDoc(userDocRef, {
        accounts: arrayRemove(accountId),
      });
      console.log(`Account ${accountId} removed from user ${userId}`);
    } catch (error) {
      console.error('Error removing account from user:', error);
      throw error;
    }
  }
}
