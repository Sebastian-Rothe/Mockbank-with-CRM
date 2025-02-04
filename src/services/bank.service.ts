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
      let totalCapitalOfUsers = 0;

      accountsSnapshot.forEach((doc) => {
        const accountData = doc.data() as Account;
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
  async getTotalCapitalOfBank(): Promise<number> {
    try {
      const accountsSnapshot = await getDocs(this.accountCollection);
      const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
      let totalCapital = 0;

      accountsSnapshot.forEach((doc) => {
        const accountData = doc.data() as Account;

        totalCapital += accountData.balance;
      });

      await updateDoc(bankDocRef, { totalBalance: totalCapital });
      return totalCapital;
    } catch (error) {
      console.error('Error calculating total user capital:', error);
      return 0;
    }
  }
}
