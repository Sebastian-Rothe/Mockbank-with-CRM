import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
// services
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedService } from '../../../../services/shared.service';
import { DashboardDataServiceService } from '../../../../services/dashboard-data-service.service';
// Materail
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
// components
import { DialogSendMoneyComponent } from '../../../../dialogs/dialog-send-money/dialog-send-money.component';
import { DialogOpenNewPocketComponent } from '../../../../dialogs/dialog-open-new-pocket/dialog-open-new-pocket.component';
import { DialogMoveMoneyComponent } from '../../../../dialogs/dialog-move-money/dialog-move-money.component';
import { DialogEditAccountComponent } from '../../../../dialogs/dialog-edit-account/dialog-edit-account.component';
import { DialogConfirmDeleteAccComponent } from '../../../../dialogs/dialog-confirm-delete-acc/dialog-confirm-delete-acc.component';
//
import { Account } from '../../../../models/account.class';
import { User } from '../../../../models/user.class';
@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    MatCard,
    MatIconModule,
    MatCardContent,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatIcon,
    CommonModule,
    MatMenu,
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent {
  uid: string = '';
  accounts: Account[] = [];
  totalBalance: number = 0;

  constructor(
    private dashboardData: DashboardDataServiceService,
    private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private authService: FirebaseAuthService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.authService.uid$.subscribe((uid) => {
      console.log(uid, 'at dash');

      if (uid) {
        this.dashboardData.loadUser(uid);
      }
    });
    this.dashboardData.accounts$.subscribe((accounts) => {
      this.accounts = accounts;
      this.totalBalance = accounts.reduce(
        (sum, account) => sum + account.balance,
        0
      );
    });
  }

  openSendMoneyDialog(accountId: string): void {
    const dialogRef = this.dialog.open(DialogSendMoneyComponent, {
      data: { senderAccountId: accountId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.loadUser(this.uid); // Oder: this.loadTransfers();
      }
    });
  }

  openNewPocketDialog(): void {
    const dialogRef = this.dialog.open(DialogOpenNewPocketComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Accounts neu laden, wenn ein neues Konto erstellt wurde
        // this.loadUser(this.uid); // Oder: this.loadAccounts(this.user?.accounts || []);
      }
    });
  }

  openMoveMoneyDialog(accountId: string): void {
    const dialogRef = this.dialog.open(DialogMoveMoneyComponent, {
      data: { senderAccountId: accountId }, // Übergabe der Account-ID
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Accounts oder Transfers neu laden, wenn Geld verschoben wurde
        // this.loadUser(this.uid); // Oder: this.loadTransfers
      }
    });
  }

  openEditAccountDialog(accountID: string): void {
    const dialogRef = this.dialog.open(DialogEditAccountComponent, {
      width: '400px',
      data: { accountID: accountID }, // Übergabe der Account-ID
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Accounts neu laden, wenn Änderungen vorgenommen wurden
        // this.loadUser(this.uid); // Oder: this.loadAccounts(this.user?.accounts || []);
        console.log('thank you');
      }
    });
  }

  openDeleteAccountDialog(accountId: string, userId: string): void {
    const dialogRef = this.dialog.open(DialogConfirmDeleteAccComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the account with ID ${accountId}? The money in the account will be lost.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // Lösche das Konto aus der Account-Sammlung
        this.firebaseService
          .deleteAccount(accountId)
          .then(() => {
            // Entferne die accountId aus dem Benutzerobjekt
            return this.firebaseService.removeAccountFromUser(
              userId,
              accountId
            );
          })
          .then(() => {
            console.log('Account deleted and removed from user successfully');
            // return this.loadUser(this.uid);
          })
          .catch((error) => {
            console.error('Error deleting account:', error);
          });
      }
    });
  }

  getFormattedCurrency(value: number) {
    return this.sharedService.getFormattedCurrency(value);
  }
}
