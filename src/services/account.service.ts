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

  /**
   * Generates a unique account ID.
   * @returns {string} A unique account identifier.
   */
  private generateAccountId(): string {
    return `ACC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Creates the account data object.
   * @param {string} userId - The user ID.
   * @param {{ accountName: string; balance: number; currency: string }} details - Account details.
   * @param {string} accountId - The generated account ID.
   * @returns {Record<string, any>} The account data.
   */
  private createAccountData(
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
  private async addAccountToFirestore(
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
   */
  private async updateUserAccounts(
    userId: string,
    accountId: string
  ): Promise<void> {
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
      const accountData = this.createAccountData(userId, accountDetails, accountId);
      await this.addAccountToFirestore(accountId, accountData);
      await this.updateUserAccounts(userId, accountId);
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
  if (!userId) {
    throw new Error('Invalid userId provided.');
  }
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
