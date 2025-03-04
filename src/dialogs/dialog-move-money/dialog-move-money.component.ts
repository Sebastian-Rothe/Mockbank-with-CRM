import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
//  material
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
// models
import { Transfer } from '../../models/transfer.class';
import { User } from '../../models/user.class';
import { Account } from '../../models/account.class';
//  services
import { FirebaseService } from '../../services/firebase.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { AccountService } from '../../services/account.service';
import { SnackbarService } from '../../services/snackbar.service';

/**
 * DialogMoveMoneyComponent is responsible for handling the logic to open a dialog that allows a user
 * to move money between accounts. It includes validation of user input and interaction with the
 * Firebase service to transfer funds. If the user is not logged in or provides invalid details,
 * appropriate error messages will be shown.
 *
 * @component
 * @example
 * <app-dialog-move-money></app-dialog-move-money>
 */
@Component({
  selector: 'app-dialog-move-money',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatOption,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
    MatIcon
  ],
  templateUrl: './dialog-move-money.component.html',
  styleUrls: ['./dialog-move-money.component.scss'],
})
export class DialogMoveMoneyComponent {
  uid: string | null = null; 
  user: User | null = null;
  transfer = new Transfer(); 
  totalBalance: number = 0; 
  userAccounts: Account[] = []; 

  senderAccountId: string; 
  category: string = 'Internal Transfer';

  /**
   * Creates an instance of DialogMoveMoneyComponent.
   * @param {FirebaseService} firebaseService - Service to handle Firebase operations.
   * @param {AccountService} accountService - Service to handle account operations.
   * @param {FirebaseAuthService} authService - Service to handle authentication operations.
   * @param {MatDialogRef<DialogMoveMoneyComponent>} dialogRef - Reference to the current dialog instance.
   * @param {SnackbarService} snackbarService - Service to display snackbar messages.
   * @param {any} data - Data passed to the dialog.
   */
  constructor(
    private firebaseService: FirebaseService,
    private accountService: AccountService,
    private authService: FirebaseAuthService,
    public dialogRef: MatDialogRef<DialogMoveMoneyComponent>,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: { senderAccountId: string }
  ) {
    this.senderAccountId = data.senderAccountId; 
  }

  ngOnInit(): void {
    this.uid = this.authService.getUid();

    if (this.uid) {
      this.loadUser(this.uid);
    }
  }

  /**
   * Loads the user data.
   * @param {string} uid - The user ID.
   * @returns {Promise<void>} A promise that resolves when the user data is loaded.
   */
  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.firebaseService.getUser(uid);

      if (this.user && this.user.accounts.length > 0) {
        await this.loadAccounts(this.user.accounts);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  /**
   * Loads the accounts for the user.
   * @param {string[]} accountIds - The account IDs.
   * @returns {Promise<void>} A promise that resolves when the accounts are loaded.
   */
  async loadAccounts(accountIds: string[]): Promise<void> {
    try {
      const accounts = await Promise.all(
        accountIds.map(async (accountId) => {
          const accountData = await this.accountService.getAccount(accountId);
          return Account.fromJson(accountData); // Umwandlung in Account-Objekt mit fromJson
        })
      );

      this.userAccounts = accounts;
      this.totalBalance = accounts.reduce(
        (sum, account) => sum + account.balance,
        0
      );
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }

  /**
   * Moves money from the sender account to the receiver account.
   */
  moveMoney(): void {
    if (this.senderAccountId && this.transfer.receiverAccountId) {
      this.firebaseService
        .transferFunds(
          this.senderAccountId,
          this.transfer.receiverAccountId,
          this.transfer.amount,
          this.transfer.description,
          this.category
        )
        .then(() => {
          this.snackbarService.success('Money transferred successfully.');
          this.closeDialog();
        })
        .catch((error) => {
          console.error('Transfer failed:', error);
          this.snackbarService.error('Transfer failed.');
        });
    } else {
      console.error('Sender or receiver account ID missing.');
      this.snackbarService.error('Sender or receiver account ID missing.');
    }
  }

  /**
   * Closes the dialog without making any changes.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
