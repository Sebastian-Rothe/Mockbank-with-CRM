import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  increment,
  onSnapshot
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// Models
import { Transfer } from '../models/transfer.class';
import { Account } from '../models/account.class';
import { User } from '../models/user.class';
import { SnackbarService } from './snackbar.service';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  firestore: Firestore = inject(Firestore);
  private snackbarService: SnackbarService = inject(SnackbarService);
  private dialogService: DialogService = inject(DialogService);

  constructor() {}

  async getAllTransfers(): Promise<Transfer[]> {
    try {
      const transfersCollection = collection(this.firestore, 'transfers');
      const querySnapshot = await getDocs(transfersCollection);
      return querySnapshot.docs.map(
        (doc) => new Transfer(doc.data() as Transfer)
      );
    } catch (error) {
      console.error('Error when calling up all transfers:', error);
      throw error;
    }
  }

  async getTransfersForUser(user: User): Promise<Transfer[]> {
    try {
      const allTransfers: Transfer[] = [];

      for (const accountId of user.accounts) {
        const transfersForAccount = await this.getTransfersForAccount(accountId);
        allTransfers.push(...transfersForAccount);
      }

      return allTransfers;
    } catch (error) {
      console.error('Fehler beim Abrufen der Transfers:', error);
      throw error;
    }
  }

  async getTransfersForAccount(accountId: string): Promise<Transfer[]> {
    const senderQuery = this.createTransfersQuery('senderAccountId', accountId);
    const receiverQuery = this.createTransfersQuery('receiverAccountId', accountId);

    const [senderTransfers, receiverTransfers] = await Promise.all([
      this.fetchTransfers(senderQuery),
      this.fetchTransfers(receiverQuery),
    ]);

    return [...senderTransfers, ...receiverTransfers];
  }

  createTransfersQuery(field: string, value: string) {
    return query(collection(this.firestore, 'transfers'), where(field, '==', value));
  }

  async fetchTransfers(transfersQuery: any): Promise<Transfer[]> {
    const snapshot = await getDocs(transfersQuery);
    return snapshot.docs.map((doc) => this.createTransferFromDoc(doc));
  }

  createTransferFromDoc(doc: any): Transfer {
    const transferData = doc.data();
    return new Transfer(transferData);
  }

  async transferFunds(
    senderAccountId: string,
    receiverAccountId: string,
    amount: number,
    description?: string,
    category?: string
  ): Promise<void> {
    try {
      const [senderData, receiverData] = await this.getAccounts(senderAccountId, receiverAccountId);
      const bankData = await this.getBankData();
      const transactionFee = bankData['transactionFee'];
      const bankAccountId = 'ACC-1738235430074-182';

      const { feeAmount, isBankTransfer } = this.calculateFee(
        senderData,
        receiverData,
        senderAccountId,
        receiverAccountId,
        bankAccountId,
        transactionFee
      );

      if (senderData.balance < amount + feeAmount) {
        throw new Error('Insufficient funds for transfer and fee.');
      }

      await this.processTransfer(
        senderData,
        receiverData,
        amount,
        description,
        category,
        feeAmount,
        bankAccountId,
        bankData
      );

      this.snackbarService.success('Transfer completed successfully!');
    } catch (error) {
      if (error === 'Insufficient funds for transfer and fee.') {
        this.dialogService.openDialog('Error', error, 'error');
      } else {
        this.dialogService.openDialog('Error', 'Error processing transfer: ' + error, 'error');
      }
      throw error;
    }
  }

  async getAccounts(senderAccountId: string, receiverAccountId: string): Promise<[Account, Account]> {
    const senderSnap = await getDoc(doc(this.firestore, 'accounts', senderAccountId));
    const receiverSnap = await getDoc(doc(this.firestore, 'accounts', receiverAccountId));

    if (!senderSnap.exists() || !receiverSnap.exists()) {
      throw new Error('Sender or receiver account not found.');
    }

    return [
      Account.fromJson(senderSnap.data()),
      Account.fromJson(receiverSnap.data()),
    ];
  }

  async getBankData(): Promise<any> {
    const bankDocRef = doc(this.firestore, 'bank', 'mainBank');
    const bankSnap = await getDoc(bankDocRef);

    if (!bankSnap.exists()) {
      throw new Error('Bank data not found.');
    }

    return bankSnap.data();
  }

  private calculateFee(
    senderData: Account,
    receiverData: Account,
    senderAccountId: string,
    receiverAccountId: string,
    bankAccountId: string,
    transactionFee: number
  ) {
    const isBankTransfer =
      senderAccountId === bankAccountId || receiverAccountId === bankAccountId;
    const isInternalTransfer = senderData.userId === receiverData.userId;

    const feeAmount = isBankTransfer
      ? 0
      : isInternalTransfer
      ? transactionFee * 0.1
      : transactionFee;

    return { feeAmount, isBankTransfer };
  }

  async processTransfer(
    senderData: Account,
    receiverData: Account,
    amount: number,
    description: string | undefined,
    category: string | undefined,
    feeAmount: number,
    bankAccountId: string,
    bankData: any
  ) {
    const transfer = new Transfer({
      senderAccountId: senderData.accountId,
      senderAccountName: senderData.accountName,
      senderUserId: senderData.userId,
      receiverAccountId: receiverData.accountId,
      receiverAccountName: receiverData.accountName,
      receiverUserId: receiverData.userId,
      amount,
      description,
      category,
    });

    await setDoc(
      doc(collection(this.firestore, 'transfers'), transfer.transferId),
      transfer.toPlainObject()
    );

    if (feeAmount > 0) {
      await this.processFeeTransfer(senderData, feeAmount, bankAccountId);
    }

    await this.updateAccountBalance(senderData.accountId, -amount - feeAmount);
    await this.updateAccountBalance(receiverData.accountId, amount);
  }

  async processFeeTransfer(
    senderData: Account,
    feeAmount: number,
    bankAccountId: string
  ) {
    const bankTransfer = new Transfer({
      senderAccountId: senderData.accountId,
      senderAccountName: senderData.accountName,
      senderUserId: senderData.userId,
      receiverAccountId: bankAccountId,
      receiverAccountName: 'Main Bank',
      receiverUserId: 'yBr3oAoV5HOBEHBxmTEcFwmR06H2',
      amount: feeAmount,
      description: `Transaction Fee`,
      category: 'Fee',
    });

    await setDoc(
      doc(collection(this.firestore, 'transfers'), bankTransfer.transferId),
      bankTransfer.toPlainObject()
    );
  }

  private async updateAccountBalance(accountId: string, amountChange: number) {
    const accountDocRef = doc(this.firestore, 'accounts', accountId);
    await updateDoc(accountDocRef, {
      balance: increment(amountChange),
    });
  }

  async deleteTransfer(transferId: string): Promise<void> {
    try {
      const transferDocRef = doc(this.firestore, 'transfers', transferId);
      const transferSnap = await getDoc(transferDocRef);

      if (!transferSnap.exists()) {
        this.dialogService.openDialog('Error', 'Transfer not found.', 'error');
        throw new Error('Transfer not found.');
      }

      const transferData = transferSnap.data() as Transfer;

      const senderDocRef = doc(this.firestore, 'accounts', transferData.senderAccountId);
      const receiverDocRef = doc(this.firestore, 'accounts', transferData.receiverAccountId);

      const [senderSnap, receiverSnap] = await Promise.all([
        getDoc(senderDocRef),
        getDoc(receiverDocRef),
      ]);

      const updates: Promise<void>[] = [];

      if (senderSnap.exists()) {
        const senderAccount = Account.fromJson(senderSnap.data());
        senderAccount.balance += transferData.amount;
        updates.push(updateDoc(senderDocRef, senderAccount.toJson()));
      }

      if (receiverSnap.exists()) {
        const receiverAccount = Account.fromJson(receiverSnap.data());
        receiverAccount.balance -= transferData.amount;
        updates.push(updateDoc(receiverDocRef, receiverAccount.toJson()));
      }

      updates.push(deleteDoc(transferDocRef));

      await Promise.all(updates);

      this.snackbarService.success(`Transfer ${transferId} successfully deleted.`);
    } catch (error) {
      this.dialogService.openDialog('Error', 'Error deleting transfer: ' + error, 'error');
      throw error;
    }
  }

  listenForTransfers(user: User): Observable<Transfer[]> {
    return new Observable<Transfer[]>((observer) => {
      const transferRefs = user.accounts.flatMap((accountId) => [
        query(collection(this.firestore, 'transfers'), where('senderAccountId', '==', accountId)),
        query(collection(this.firestore, 'transfers'), where('receiverAccountId', '==', accountId))
      ]);

      const allTransfers: Transfer[] = [];
      const unsubscribes = transferRefs.map((transferRef) =>
        onSnapshot(transferRef, (snapshot) => {
          const transfers = snapshot.docs.map((doc) => new Transfer(doc.data() as Transfer));
          allTransfers.push(...transfers);
          observer.next(allTransfers);
        }, (error) => {
          observer.error(error);
        })
      );

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    });
  }
}
