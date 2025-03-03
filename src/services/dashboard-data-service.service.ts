import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { AccountService } from './account.service';
import { User } from '../models/user.class';
import { Account } from '../models/account.class';
import { Transfer } from '../models/transfer.class';
@Injectable({
  providedIn: 'root'
})
export class DashboardDataServiceService {
  private accountsSubject = new BehaviorSubject<Account[]>([]);
  accounts$ = this.accountsSubject.asObservable();

  private transfersSubject = new BehaviorSubject<Transfer[]>([]);
  transfers$ = this.transfersSubject.asObservable();

  constructor(private firebaseService: FirebaseService, private authService: FirebaseAuthService, private accountService: AccountService) {
    // ⬇️ Direkt auf den User-Stream hören!
    this.authService.user$.subscribe(user => {
      if (user) {
        this.loadAccounts(user.accounts);
        this.loadTransfers(user);
      }
    });
  }
  // async loadUser(uid: string): Promise<void> {
  //   try {
  //     const user = await this.firebaseService.getUser(uid);
  //     this.user$.next(user);
  //     if (user && user.accounts.length > 0) {
  //       await this.loadAccounts(user.accounts);
  //       await this.loadTransfers(user);
  //     }
  //   } catch (error) {
  //     console.error('Error loading user: ', error);
  //   }
  // }

  async loadAccounts(accountIds: string[]): Promise<void> {
    try {
      const accounts = await Promise.all(
        accountIds.map((accountId) => this.accountService.getAccount(accountId))
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
      this.firebaseService.listenForTransfers(user).subscribe(
        (transfers) => {
          const userAccounts = this.accountsSubject.getValue();
          const processedTransfers: any[] = [];

          for (const transfer of transfers) {
            const isSender = userAccounts.some(
              (account) => account.accountId === transfer.senderAccountId
            );
            const isReceiver = userAccounts.some(
              (account) => account.accountId === transfer.receiverAccountId
            );

            const exists = processedTransfers.some(
              (t) => t.transferId === transfer.transferId
            );

            if (!exists) {
              if (isSender) {
                processedTransfers.push({
                  ...transfer,
                  amount: -transfer.amount,
                  type: 'sent',
                });
              }
              if (isReceiver) {
                processedTransfers.push({
                  ...transfer,
                  amount: transfer.amount,
                  type: 'received',
                });
              }
            }
          }
          processedTransfers.sort((a, b) => b.createdAt - a.createdAt);
          this.transfersSubject.next(processedTransfers);
        },
        (error) => {
          console.error('Error loading transfers: ', error);
        }
      );
    } catch (error) {
      console.error('Error loading transfers: ', error);
    }
  }

  async loadAccountsForUser(userId: string): Promise<void> {
    try {
      const accounts = await this.firebaseService.getAccountsForUser(userId);
      this.accountsSubject.next(accounts);
    } catch (error) {
      console.error(`Error loading accounts for user ${userId}: `, error);
      this.accountsSubject.next([]);
    }
  }
  
}