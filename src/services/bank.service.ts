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
import { User } from '../models/user.class';

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

  async calculateAndDistributeInterest(user: User): Promise<void> {
    try {
      // 1. Alle bisherigen Transfers des Users abrufen
      const transfers = await this.firebaseService.getTransfersForUser(user);
  
      // 2. Letzten Zins-Transfer finden
      let lastInterestTransferDate = user.createdAt;
      const lastInterestTransfer = transfers
        .filter((transfer) => transfer.category === 'Interest')
        .sort((a, b) => b.createdAt - a.createdAt)[0];
  
      if (lastInterestTransfer) {
        lastInterestTransferDate = lastInterestTransfer.createdAt;
      }
  
      // 3. Prüfen, ob bereits eine Zahlung geplant oder erfolgt ist
      const timeSinceLastInterest = Date.now() - lastInterestTransferDate;
      const hoursSinceLastInterest = Math.floor(timeSinceLastInterest / 3600000);
      
      // **🔒 Wichtiger Fix: Sicherstellen, dass nicht bereits eine Zahlung in den letzten 5 Sekunden erstellt wurde**
      const lastInterestRecently = transfers.some(
        (t) => t.category === 'Interest' && Date.now() - t.createdAt < 5000
      );
  
      if (lastInterestRecently) {
        console.warn('Verhindert doppelte Zinszahlung: Bereits kürzlich ausgeführt.');
        return;
      }
  
      // **📌 Fix: Erster Zins soll SOFORT ausgezahlt werden**
      let interestStart = lastInterestTransferDate;
      if (!lastInterestTransfer) {
        console.log('Erste Zinszahlung erfolgt sofort nach der User-Erstellung.');
        interestStart = user.createdAt;
      } else if (hoursSinceLastInterest < 2) {
        console.log('Zinsen wurden bereits in den letzten 2 Stunden gezahlt.');
        return;
      }
  
      // 4. Gesamtguthaben des Users berechnen
      let totalBalance = 0;
      for (const accountId of user.accounts) {
        const accountData = await this.firebaseService.getAccount(accountId);
        totalBalance += accountData.balance || 0;
      }
  
      // 5. Zinsrate abrufen
      const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
      const bankSnap = await getDoc(bankDocRef);
      if (!bankSnap.exists()) {
        console.error('Bankdaten nicht gefunden!');
        return;
      }
      const bankData = bankSnap.data();
      const interestRate = bankData['interestRate']; 
  
      // 6. Zinsen berechnen
      const interestAmountPerHour = (totalBalance * interestRate) / 100 / 24; 
      const totalInterestAmount = interestAmountPerHour * hoursSinceLastInterest;
  
      // **✅ Mindestzins anwenden**
      const minimumInterest = 0.01;
      const finalInterestAmount = Math.max(totalInterestAmount, minimumInterest);
  
      if (finalInterestAmount <= 0) {
        console.log('Keine Zinsen zu zahlen.');
        return;
      }
  
      // 7. Zinsen überweisen
      const primaryAccountId = user.accounts[0];
      const interestEnd = Date.now();
  
      await this.firebaseService.transferFunds(
        'ACC-1738235430074-182',
        primaryAccountId,
        finalInterestAmount,
        `Interest credit from ${new Date(interestStart).toLocaleString()} to ${new Date(interestEnd).toLocaleString()}`,
        'Interest'
      );
  
      console.log(`Zinsen von ${finalInterestAmount} EUR für User ${user.uid} gutgeschrieben.`);
  
    } catch (error) {
      console.error('Fehler bei der Zinsberechnung:', error);
    }
  }
}
