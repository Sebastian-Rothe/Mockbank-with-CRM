import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { SharedService } from '../../../../services/shared.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { User } from '../../../../models/user.class';
import { Account } from '../../../../models/account.class';
import { FirebaseService } from '../../../../services/firebase.service';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [    MatCard,
      MatIconModule,
      MatCardContent,
      
      MatButtonModule,
      MatCardModule,
      MatIcon,
      CommonModule,
      ],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss'
})
export class TransfersComponent {
  transfers: any[] = [];
  uid: string | null = null;
  user: User | null = null; // Benutzerdaten
  userAccounts: Account[] = []; // Array von Account-Objekten
  constructor(
    private authService: FirebaseAuthService,
    private firebaseService: FirebaseService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    // Abonniere Änderungen der UID
    this.authService.uid$.subscribe((uid) => {
      if (uid) {
        this.uid = uid;
        this.loadUser(uid);
      }
    });
  }

  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.firebaseService.getUser(uid);
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
        accountIds.map((accountId) =>
          this.firebaseService.getAccount(accountId)
        )
      );
      this.userAccounts = accounts.map(Account.fromJson);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }

  async loadTransfers(): Promise<void> {
    try {
      if (this.user) {
        const transfers = await this.firebaseService.getTransfersForUser(
          this.user
        );
        this.transfers = [];

        for (const transfer of transfers) {
          const isSender = this.userAccounts.some(
            (account) => account.accountId === transfer.senderAccountId
          );
          const isReceiver = this.userAccounts.some(
            (account) => account.accountId === transfer.receiverAccountId
          );

          const exists = this.transfers.some(
            (t) => t.transferId === transfer.transferId
          );

          if (!exists) {
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
        }

        this.transfers.sort((a, b) => b.createdAt - a.createdAt);
      } else {
        console.error('User is null');
      }
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  }

  getFormattedDate(transferDate: number): string {
    return this.sharedService.formatTimestampToDate(transferDate);
  }
}