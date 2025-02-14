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
  docData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Bank } from '../models/bank.interface';
import { Account } from '../models/account.class';
import { User } from '../models/user.class';
import { Transfer } from '../models/transfer.class';
import { AccountService } from './account.service';
 

@Injectable({
  providedIn: 'root',
})
export class BankService {
  // Inject Firestore instance
  firestore: Firestore = inject(Firestore);

  // Reference to the 'bank' and 'accounts' collections in Firestore
  private bankCollection = collection(this.firestore, 'bank');
  private accountCollection = collection(this.firestore, 'accounts');

  constructor(private firebaseService: FirebaseService, private accountService: AccountService) {}

  /**
   * Fetches the bank data from Firestore.
   * @returns A promise resolving to the bank data or null if not found.
   */
  async getBankData(): Promise<Bank | null> {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return getDoc(bankDocRef).then((snapshot) => {
      return snapshot.exists() ? (snapshot.data() as Bank) : null;
    });
  }

  /**
   * Updates the bank document with the provided data.
   * @param updatedData Partial bank data to be updated.
   * @returns A promise resolving when the update is complete.
   */
  async updateBank(updatedData: Partial<Bank>): Promise<void> {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return updateDoc(bankDocRef, updatedData);
  }

  /**
   * Returns an observable that listens for changes in the bank document.
   * @returns An observable of the bank data.
   */
  getBankObservable(): Observable<Bank | undefined> {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return docData(bankDocRef, { idField: 'id' }) as Observable<
      Bank | undefined
    >;
  }

  /**
   * Calculates the total capital held by all users (excluding the bank).
   * @returns A promise resolving to the total user capital.
   */
  async getTotalUserCapital(): Promise<number> {
    try {
      const accountsSnapshot = await getDocs(this.accountCollection);
      let totalCapitalOfUsers = 0;

      accountsSnapshot.forEach((doc) => {
        const accountData = doc.data() as Account;

        // Exclude the bank's account from user capital calculation
        if (accountData.accountId === 'ACC-1738235430074-182') {
          return;
        }

        totalCapitalOfUsers += accountData.balance;
      });

      return totalCapitalOfUsers;
    } catch (error) {
      console.error('Error calculating total user capital:', error);
      return 0;
    }
  }

  /**
   * Calculates the total capital of the bank, including all account balances.
   * Updates the bank document with the new total balance.
   * @returns A promise resolving to the total capital of the bank.
   */
  async getTotalCapitalOfBank(): Promise<number> {
    try {
      const accountsSnapshot = await getDocs(this.accountCollection);
      const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
      let totalCapital = 0;

      accountsSnapshot.forEach((doc) => {
        const accountData = doc.data() as Account;
        totalCapital += accountData.balance;
      });

      // Update the bank document with the new total balance
      await updateDoc(bankDocRef, { totalBalance: totalCapital });

      return totalCapital;
    } catch (error) {
      console.error('Error calculating total bank capital:', error);
      return 0;
    }
  }


  /**
   * Retrieves all transfers for a user.
   * @param {User} user - The user whose transfers are retrieved.
   * @returns {Promise<Transfer[]>} - A promise resolving to the list of transfers.
   */
  async getUserTransfers(user: User): Promise<Transfer[]> {
    return this.firebaseService.getTransfersForUser(user);
  }

  /**
   * Finds the last interest transfer date for a user.
   * @param {Transfer[]} transfers - List of transfers.
   * @param {number} userCreatedAt - Timestamp of user creation.
   * @returns {number} - The last interest transfer timestamp.
   */
  getLastInterestTransferDate(transfers: Transfer[], userCreatedAt: number): number {
    const lastInterestTransfer = transfers
      .filter((transfer) => transfer.category === 'Interest')
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    return lastInterestTransfer ? lastInterestTransfer.createdAt : userCreatedAt;
  }

  /**
   * Checks if interest was already credited recently.
   * @param {Transfer[]} transfers - List of transfers.
   * @returns {boolean} - True if interest was recently credited, false otherwise.
   */
  hasRecentInterestTransfer(transfers: Transfer[]): boolean {
    return transfers.some((t) => t.category === 'Interest' && Date.now() - t.createdAt < 5000);
  }

  /**
   * Calculates the total balance of a user.
   * @param {string[]} accountIds - List of account IDs.
   * @returns {Promise<number>} - The total balance.
   */
  async getTotalBalance(accountIds: string[]): Promise<number> {
    let totalBalance = 0;
    for (const accountId of accountIds) {
      const accountData = await this.accountService.getAccount(accountId);
      totalBalance += accountData.balance || 0;
    }
    return totalBalance;
  }

  /**
   * Retrieves the current interest rate from the bank document.
   * @returns {Promise<number>} - The interest rate.
   */
  async getInterestRate(): Promise<number> {
    const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
    const bankSnap = await getDoc(bankDocRef);
    if (!bankSnap.exists()) throw new Error('Bank data not found!');
    
    return bankSnap.data()['interestRate'];
  }

  /**
   * Calculates the interest amount based on balance, rate, and hours passed.
   * @param {number} balance - The total user balance.
   * @param {number} interestRate - The interest rate.
   * @param {number} hours - Hours since the last interest was applied.
   * @returns {number} - The final interest amount.
   */
  calculateInterest(balance: number, interestRate: number, hours: number): number {
    const interestPerHour = (balance * interestRate) / 100 / 24;
    return Math.max(interestPerHour * hours, 0.01); // Ensuring a minimum interest
  }

  /**
   * Transfers the calculated interest to the user's primary account.
   * @param {string} accountId - The account receiving the interest.
   * @param {number} amount - The interest amount.
   * @param {number} start - Interest calculation start time.
   */
  async distributeInterest(accountId: string, amount: number, start: number): Promise<void> {
    const end = Date.now();
    await this.firebaseService.transferFunds(
      'ACC-1738235430074-182',
      accountId,
      amount,
      `Interest credit from ${new Date(start).toLocaleString()} to ${new Date(end).toLocaleString()}`,
      'Interest'
    );
    console.log(`Interest of ${amount} EUR credited to ${accountId}.`);
  }

  /**
   * Main function to calculate and distribute interest for a user.
   * @param {User} user - The user receiving interest.
   */
  async calculateAndDistributeInterest(user: User): Promise<void> {
    try {
      const transfers = await this.getUserTransfers(user);
      if (this.hasRecentInterestTransfer(transfers)) {
        console.warn('Preventing duplicate interest payment.');
        return;
      }

      const lastInterestDate = this.getLastInterestTransferDate(transfers, user.createdAt);
      const hoursSinceLastInterest = Math.floor((Date.now() - lastInterestDate) / 3600000);

      if (hoursSinceLastInterest < 2 && lastInterestDate !== user.createdAt) {
        console.log('Interest was already paid in the last 2 hours.');
        return;
      }

      const totalBalance = await this.getTotalBalance(user.accounts);
      const interestRate = await this.getInterestRate();
      const interestAmount = this.calculateInterest(totalBalance, interestRate, hoursSinceLastInterest);

      if (interestAmount > 0) {
        await this.distributeInterest(user.accounts[0], interestAmount, lastInterestDate);
      }
    } catch (error) {
      console.error('Error calculating interest:', error);
    }
  }
}
