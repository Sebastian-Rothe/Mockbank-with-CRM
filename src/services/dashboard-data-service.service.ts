import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { User } from '../models/user.class';
import { Account } from '../models/account.class';
@Injectable({
  providedIn: 'root'
})
export class DashboardDataServiceService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
 
  private accountsSubject = new BehaviorSubject<Account[]>([]);
  accounts$ = this.accountsSubject.asObservable();

  private transfersSubject = new BehaviorSubject<any[]>([]);
  transfers$ = this.transfersSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {}

  async loadUser(uid: string): Promise<void> {
    try {
      const user = await this.firebaseService.getUser(uid);
      this.userSubject.next(user);
      if (user && user.accounts.length > 0) {
        await this.loadAccounts(user.accounts);
        await this.loadTransfers(user);
      }
    } catch (error) {
      console.error('Error loading user: ', error);
    }
  }

  async loadAccounts(accountIds: string[]): Promise<void> {
    try {
      const accounts = await Promise.all(
        accountIds.map((accountId) => this.firebaseService.getAccount(accountId))
      );
      // Wenn du eine Transformation benötigst (z.B. Account.fromJson)
      const accountObjs = accounts.map(Account.fromJson);
      this.accountsSubject.next(accountObjs);
    } catch (error) {
      console.error('Error loading accounts: ', error);
    }
  }

  async loadTransfers(user: User): Promise<void> {
    try {
      const transfers = await this.firebaseService.getTransfersForUser(user);
      const userAccounts = this.accountsSubject.getValue();
      const processedTransfers: any[] = [];

      for (const transfer of transfers) {
        const isSender = userAccounts.some(
          (account) => account.accountId === transfer.senderAccountId
        );
        const isReceiver = userAccounts.some(
          (account) => account.accountId === transfer.receiverAccountId
        );

        // Überprüfen, ob der Transfer bereits verarbeitet wurde
        const exists = processedTransfers.some(
          (t) => t.transferId === transfer.transferId
        );

        if (!exists) {
          if (isSender) {
            processedTransfers.push({
              ...transfer,
              amount: -transfer.amount, // Negativ, wenn gesendet
              type: 'sent',
            });
          }
          if (isReceiver) {
            processedTransfers.push({
              ...transfer,
              amount: transfer.amount, // Positiv, wenn empfangen
              type: 'received',
            });
          }
        }
      }
      // Sortieren nach Datum (neueste zuerst)
      processedTransfers.sort((a, b) => b.createdAt - a.createdAt);
      this.transfersSubject.next(processedTransfers);
    } catch (error) {
      console.error('Error loading transfers: ', error);
    }
  }
}