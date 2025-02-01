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
  firestore: Firestore = inject(Firestore);
  private bankCollection = collection(this.firestore, 'bank');
  private accountCollection = collection(this.firestore, 'accounts');

  constructor(private firebaseService: FirebaseService) {}

  getBankData() {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return getDoc(bankDocRef).then((snapshot) => {
      return snapshot.exists() ? (snapshot.data() as Bank) : null;
    });
  }
  updateBank(updatedData: Partial<Bank>) {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return updateDoc(bankDocRef, updatedData);
  }
  getBankObservable(): Observable<Bank | undefined> {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return docData(bankDocRef, { idField: 'id' }) as Observable<
      Bank | undefined
    >;
  }

  async getTotalUserCapital(): Promise<number> {
    try {
      const accountsSnapshot = await getDocs(this.accountCollection);
      const bankDocRef = doc(this.firestore, 'bank', 'mainBank'); // Bank-Dokument Referenz
      let totalCapital = 0;

      accountsSnapshot.forEach((doc) => {
        const accountData = doc.data() as Account;
        totalCapital += accountData.balance;
      });

      // `totalBalance` nur noch auf `totalUserCapital` setzen, keine Dopplung!
      await updateDoc(bankDocRef, { totalBalance: totalCapital });
      return totalCapital;
    } catch (error) {
      console.error('Error calculating total user capital:', error);
      return 0;
    }
  }
  // async updateTotalBankBalance(): Promise<void> {
  //   try {
  //     const totalUserCapital = await this.getTotalUserCapital(); // Kapital der User berechnen
  //     const bankDocRef = doc(this.firestore, 'bank', 'mainBank'); // Bank-Dokument Referenz

  //     // Bank-Dokument abrufen
  //     const bankSnap = await getDoc(bankDocRef);
  //     if (!bankSnap.exists()) {
  //       throw new Error('Bank document does not exist.');
  //     }

  //     const bankData = bankSnap.data();
  //     const currentTotalBalance = bankData['totalBalance'] ?? 0; // Fallback auf 0, falls undefined

  //     const updatedTotalBalance = currentTotalBalance + totalUserCapital; // Neues Gesamtguthaben berechnen

  //     // Bank-TotalBalance updaten
  //     await updateDoc(bankDocRef, { totalBalance: updatedTotalBalance });

  //     console.log('Bank total balance updated successfully:', updatedTotalBalance);
  //   } catch (error) {
  //     console.error('Error updating bank total balance:', error);
  //     throw error;
  //   }
  // }
}
