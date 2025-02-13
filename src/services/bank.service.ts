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
import { Bank } from '../models/bank.interface';
import { Account } from '../models/account.class';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class BankService {
  // Inject Firestore instance
  firestore: Firestore = inject(Firestore);

  // Reference to the 'bank' and 'accounts' collections in Firestore
  private bankCollection = collection(this.firestore, 'bank');
  private accountCollection = collection(this.firestore, 'accounts');

  constructor(private firebaseService: FirebaseService) {}

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
}
