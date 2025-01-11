import { Component, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.class';
import { MatCard } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogSendMoneyComponent } from './dialog-send-money/dialog-send-money.component';
import { DialogOpenNewPocketComponent } from './dialog-open-new-pocket/dialog-open-new-pocket.component';
import { DialogMoveMoneyComponent } from './dialog-move-money/dialog-move-money.component';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Account } from '../../../models/account.class'; 
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../services/shared.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCard, MatButtonModule, MatCardModule, MatIcon, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  uid: string | null = null;
  user: User | null = null; // Benutzerdaten
  totalBalance: number = 0; // Gesamtsumme der Konten
  userAccounts: Account[] = []; // Array von Account-Objekten, statt nur einem Account-Objekt
  transfers: any[] = []; // Eine Liste für die Transfers des Benutzers
 
 
  constructor(
    private sharedService: SharedService,
    private authService: FirebaseAuthService,
    private firebaseService: FirebaseService,
    public dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.uid = this.authService.getUid();
    console.log('Current UID:', this.uid);

    if (this.uid) {
      this.loadUser(this.uid);
    }

  }

  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.firebaseService.getUser(uid);
      console.log('Loaded user:', this.user);

      if (this.user && this.user.accounts.length > 0) {
        await this.loadAccounts(this.user.accounts);
        await this.loadTransfers();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async loadAccounts(accountIds: string[]): Promise<void> {
    try {
      const accounts = await Promise.all(
        accountIds.map(async (accountId) => {
          const accountData = await this.firebaseService.getAccount(accountId);
          return Account.fromJson(accountData);  // Umwandlung in Account-Objekt mit fromJson
        })
      );

      this.userAccounts = accounts;
      this.totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
      console.log('Total Balance:', this.totalBalance);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }

  async loadTransfers(): Promise<void> {
    try {
      if (this.user) {
        const transfers = await this.firebaseService.getTransfersForUser(this.user);
  
        this.transfers = [];
  
        // Für jeden Transfer erstellen wir zwei Einträge: einen als "sent" und einen als "received".
        for (const transfer of transfers) {
          const isSender = this.userAccounts.some(
            (account) => account.accountId === transfer.senderAccountId
          );
  
          const isReceiver = this.userAccounts.some(
            (account) => account.accountId === transfer.receiverAccountId
          );
  
          // Nur wenn der User beteiligt ist, wird der Transfer angezeigt.
          if (isSender) {
            this.transfers.push({
              ...transfer,
              amount: -transfer.amount, // Negativ für "sent"
              type: 'sent',
            });
          }
  
          if (isReceiver) {
            this.transfers.push({
              ...transfer,
              amount: transfer.amount, // Positiv für "received"
              type: 'received',
            });
          }
        }
  
        console.log('Processed transfers:', this.transfers);
      } else {
        console.error('User is null');
      }
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  }
  
  
  

  openSendMoneyDialog(): void {
    this.dialog.open(DialogSendMoneyComponent);
  }

  openNewPocketDialog(): void {
    this.dialog.open(DialogOpenNewPocketComponent);
  }

  openMoveMoneyDialog(accountId: string): void {
    this.dialog.open(DialogMoveMoneyComponent, {
      data: { senderAccountId: accountId } // Übergabe der Account-ID
    });
    console.log('Sender Account ID:', accountId);
  }

  getFormattedDate(transferDate: number): string {
    let date: number = transferDate;
    return this.sharedService.formatTimestampToDate(date);
  }
  
}
