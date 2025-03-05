import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
// services
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { SharedService } from '../../../../services/shared.service';
import { DashboardDataServiceService } from '../../../../services/dashboard-data-service.service';
import { AccountService } from '../../../../services/account.service';
import { SnackbarService } from '../../../../services/snackbar.service';
import { DialogService } from '../../../../services/dialog.service';
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
//
import { Account } from '../../../../models/account.class';

/**
 * AccountsComponent is responsible for displaying and managing user accounts.
 * It provides functionalities to send money, create new accounts, move money between accounts,
 * edit account details, and delete accounts.
 *
 * @component
 * @example
 * <app-accounts [userId]="userId"></app-accounts>
 */
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
  /**
   * Observable for the user ID.
   * @type {Observable<string>}
   */
  uid$ = this.authService.uid$;

  /**
   * User ID.
   * @type {string}
   */
  uid: string = '';

  /**
   * List of user accounts.
   * @type {Account[]}
   */
  accounts: Account[] = [];

  /**
   * User ID passed as an input to the component.
   * @type {string | null}
   */
  @Input() userId: string | null = null;

  /**
   * Flag indicating if the screen size is small.
   * @type {boolean}
   */
  isSmallScreen: Boolean = false;

  /**
   * Flag indicating if the screen size is extra small.
   * @type {boolean}
   */
  isExtraSmallScreen: Boolean = false;

  /**
   * Creates an instance of AccountsComponent.
   * @param {DashboardDataServiceService} dashboardData - Service to handle dashboard data operations.
   * @param {MatDialog} dialog - Service to manage dialog interactions.
   * @param {FirebaseService} firebaseService - Service to handle Firebase operations.
   * @param {FirebaseAuthService} authService - Service to handle authentication operations.
   * @param {SharedService} sharedService - Service to handle shared operations.
   * @param {AccountService} accountService - Service to handle account operations.
   * @param {SnackbarService} snackbarService - Service to display snackbar messages.
   * @param {DialogService} dialogService - Service to manage dialog interactions.
   */
  constructor(
    private dashboardData: DashboardDataServiceService,
    private dialog: MatDialog,
    private authService: FirebaseAuthService,
    private sharedService: SharedService,
    private accountService: AccountService,
    private snackbarService: SnackbarService,
    private dialogService: DialogService
  ) {}

  /**
   * Initializes the component by loading user accounts and setting screen size flags.
   */
  ngOnInit(): void {
    if (this.userId) {
      this.dashboardData.loadAccountsForUser(this.userId).then(() => {
        this.dashboardData.accounts$.subscribe(accounts => {
          this.accounts = accounts;
          console.log('Accounts loaded for user:', accounts);
        });
      });
    } else {
      this.dashboardData.accounts$.subscribe(accounts => {
        this.accounts = accounts;
      });
    }
    this.onResize();
  }

  /**
   * Handles window resize events to set screen size flags.
   * @param {Event} event - The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isSmallScreen = window.innerWidth <= 600;
    this.isExtraSmallScreen = window.innerWidth <= 400;
  }

  /**
   * Opens the send money dialog for the specified account.
   * @param {string} accountId - The ID of the sender account.
   */
  openSendMoneyDialog(accountId: string): void {
    const dialogRef = this.dialog.open(DialogSendMoneyComponent, {
      data: { senderAccountId: accountId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.loadUser(this.uid); // Or: this.loadTransfers();
      }
    });
  }

  /**
   * Opens the dialog to create a new account.
   */
  openNewPocketDialog(): void {
    const dialogRef = this.dialog.open(DialogOpenNewPocketComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.dashboardData.loadUser(this.uid); // Reload user data
      }
    });
  }

  /**
   * Opens the move money dialog for the specified account.
   * @param {string} accountId - The ID of the sender account.
   */
  openMoveMoneyDialog(accountId: string): void {
    const dialogRef = this.dialog.open(DialogMoveMoneyComponent, {
      width: '400px',
      data: { senderAccountId: accountId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.dashboardData.loadUser(this.uid); //
      }
    });
  }

  /**
   * Opens the edit account dialog for the specified account.
   * @param {string} accountID - The ID of the account to edit.
   */
  openEditAccountDialog(accountID: string): void {
    const dialogRef = this.dialog.open(DialogEditAccountComponent, {
      width: '400px',
      data: { accountID: accountID },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.dashboardData.loadUser(this.uid); //
      }
    });
  }

  /**
   * Opens the delete account dialog for the specified account.
   * @param {string} accountId - The ID of the account to delete.
   */
  openDeleteAccountDialog(accountId: string): void {
    this.dialogService.openDialog(
      'Confirm Deletion',
      `Are you sure you want to delete the account with ID ${accountId}? The money in the account will be lost.`
    ).then(async (confirmed) => {
      if (confirmed) {
        try {
          const userId = this.userId || (await this.authService.getUid());
          if (!userId) {
            throw new Error('User ID is not available.');
          }
          await this.accountService.deleteAccount(accountId);
          await this.accountService.removeAccountFromUser(userId, accountId);
          this.snackbarService.success('Account deleted successfully.');
          this.dashboardData.loadAccountsForUser(userId); 
        } catch (error) {
          this.dialogService.openDialog('Error', 'Failed to delete account: ' + error);
        }
      }
    });
  }

  /**
   * Formats the currency value.
   * @param {number} value - The currency value.
   * @returns {string} The formatted currency string.
   */
  getFormattedCurrency(value: number) {
    return this.sharedService.getFormattedCurrency(value);
  }
}
