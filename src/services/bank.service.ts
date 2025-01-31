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
  docData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Bank } from '../models/bank.interface';
@Injectable({
  providedIn: 'root'
})
export class BankService {
  firestore: Firestore = inject(Firestore);
  private bankCollection = collection(this.firestore, 'bank');

  constructor() { }

  getBankData() {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return getDoc(bankDocRef).then(snapshot => {
      return snapshot.exists() ? snapshot.data() as Bank : null;
    });
  }
  updateBank(updatedData: Partial<Bank>) {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return updateDoc(bankDocRef, updatedData);
  }
  getBankObservable(): Observable<Bank | undefined> {
    const bankDocRef = doc(this.bankCollection, 'mainBank');
    return docData(bankDocRef, { idField: 'id' }) as Observable<Bank | undefined>;
  }
}
