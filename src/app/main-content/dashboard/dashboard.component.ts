import { Component, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.class';
import { MatCard } from '@angular/material/card';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogSendMoneyComponent } from './dialog-send-money/dialog-send-money.component';
import { DialogOpenNewPocketComponent } from './dialog-open-new-pocket/dialog-open-new-pocket.component';
import { DialogMoveMoneyComponent } from './dialog-move-money/dialog-move-money.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCard, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  uid: string | null = null;
  user: User | null = null; // Benutzerdaten
  totalBalance: number = 0; // Gesamtsumme der Konten
  userAccounts: { name: string; balance: number }[] = []; // Kontodetails

  constructor(
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
          return { name: accountData.name, balance: accountData.balance };
        })
      );

      this.userAccounts = accounts;
      this.totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
      console.log('Total Balance:', this.totalBalance);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }

  openSendMoneyDialog(): void {
    this.dialog.open(DialogSendMoneyComponent);
  }
  openNewPocketDialog(): void {
    this.dialog.open(DialogOpenNewPocketComponent);
  }
  openMoveMoneyDialog(): void {
    this.dialog.open(DialogMoveMoneyComponent);
  }
}
