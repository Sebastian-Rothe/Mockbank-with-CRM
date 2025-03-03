import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  arrayRemove,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  firestore: Firestore = inject(Firestore);

  private accountCollection = collection(this.firestore, 'accounts');

  constructor() {}

  /**
   * Retrieves an account document from the 'accounts' collection by its ID.
   * @param {string} accountId - The account ID.
   * @returns {Promise<any>} A promise that resolves with the account data.
   * @throws {Error} If the account is not found or an error occurs.
   */
  async getAccount(accountId: string): Promise<any> {
    try {
    
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

  /**
   * Generates a unique account ID.
   * @returns {string} A unique account identifier.
   */
  generateAccountId(): string {
    return `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Creates the account data object.
   * @param {string} userId - The user ID.
   * @param {{ accountName: string; balance: number; currency: string }} details - Account details.
   * @param {string} accountId - The generated account ID.
   * @returns {Record<string, any>} The account data.
   */
  createAccountData(
    userId: string,
    details: { accountName: string; balance: number; currency: string },
    accountId: string
  ): Record<string, any> {
    return {
      accountId,
      userId,
      accountName: details.accountName,
      balance: details.balance,
      currency: details.currency,
      createdAt: Date.now(),
    };
  }

  /**
   * Adds the account document to Firestore.
   * @param {string} accountId - The account ID.
   * @param {Record<string, any>} accountData - The account data.
   * @returns {Promise<void>} A promise that resolves when the account is added.
   */
  async addAccountToFirestore(
    accountId: string,
    accountData: Record<string, any>
  ): Promise<void> {
    const accountDocRef = doc(this.accountCollection, accountId);
    await setDoc(accountDocRef, accountData);
  }

  /**
   * Updates the user's document with the new account ID.
   * @param {string} userId - The user ID.
   * @param {string} accountId - The new account ID.
   * @returns {Promise<void>} A promise that resolves when the user document is updated.
   * @throws {Error} If the user is not found.
   */
  async updateUserAccounts(userId: string, accountId: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      throw new Error('User not found.');
    }
    const userData = userSnap.data();
    const accounts = userData['accounts'] || [];
    accounts.push(accountId);
    await updateDoc(userDocRef, { accounts });
  }

  /**
   * Main function to add an account for a user.
   * @param {string} userId - The user ID.
   * @param {{ accountName: string; balance: number; currency: string }} accountDetails - The account details.
   * @returns {Promise<void>} A promise that resolves when the account has been added.
   */
  async addAccount(
    userId: string,
    accountDetails: { accountName: string; balance: number; currency: string }
  ): Promise<void> {
    try {
      const accountId = this.generateAccountId();
      const accountData = this.createAccountData(
        userId,
        accountDetails,
        accountId
      );
      await this.addAccountToFirestore(accountId, accountData);
      await this.updateUserAccounts(userId, accountId);
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  }

  /**
   * Updates an account's data in Firestore.
   * @param {string} accountId - The account ID.
   * @param {any} accountData - The data to update for the account.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
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

  /**
   * Deletes an account document from Firestore.
   * @param {string} accountId - The account ID.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
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

  /**
   * Removes an account ID from a user's accounts array in Firestore.
   * @param {string} userId - The user ID.
   * @param {string} accountId - The account ID to remove.
   * @returns {Promise<void>} A promise that resolves when the removal is complete.
   * @throws {Error} If an invalid userId is provided.
   */
  async removeAccountFromUser(userId: string, accountId: string): Promise<void> {
    if (!userId) {
       throw new Error('Invalid userId provided.');
    }
    try {
       const userDocRef = doc(this.firestore, 'users', userId);
       const userSnap = await getDoc(userDocRef);
 
       if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log('Current accounts before removal:', userData['accounts']);
 
          await updateDoc(userDocRef, {
             accounts: arrayRemove(accountId),
          });
 
          console.log(`Account ${accountId} removed from user ${userId}`);
       } else {
          console.error('User document does not exist.');
       }
    } catch (error) {
       console.error('Error removing account from user:', error);
       throw error;
    }
 }
 
}
