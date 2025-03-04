import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// material
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
// models
import { Account } from '../../models/account.class';
// services
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { AccountService } from '../../services/account.service';
// components
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

/**
 * DialogOpenNewPocketComponent is responsible for handling the logic to open a dialog that allows a user
 * to create a new account (or "pocket"). It includes validation of user input and interaction with the
 * Firebase service to add the new account. If the user is not logged in or provides invalid details,
 * appropriate error messages will be shown.
 *
 * @component
 * @example
 * <app-dialog-open-new-pocket></app-dialog-open-new-pocket>
 */
@Component({
  selector: 'app-dialog-open-new-pocket',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatOption,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIcon,
  ],
  templateUrl: './dialog-open-new-pocket.component.html',
  styleUrls: ['./dialog-open-new-pocket.component.scss'],
})
export class DialogOpenNewPocketComponent implements OnInit {
  /**
   * The unique identifier of the user. It is fetched from the authentication service.
   * @type {string | null}
   */
  uid: string | null = null;

  /**
   * The account model instance representing the new account to be created.
   * @type {Account}
   */
  account: Account = new Account();

  /**
   * Creates an instance of DialogOpenNewPocketComponent.
   * @param {AccountService} accountService - Service to handle account operations.
   * @param {FirebaseAuthService} authService - Service to handle authentication operations.
   * @param {MatDialogRef<DialogOpenNewPocketComponent>} dialogRef - Reference to the current dialog instance.
   * @param {MatDialog} dialog - Service to manage dialog interactions.
   */
  constructor(
    private accountService: AccountService,
    private authService: FirebaseAuthService,
    public dialogRef: MatDialogRef<DialogOpenNewPocketComponent>,
    public dialog: MatDialog
  ) {}

  /**
   * Initializes the component by retrieving the user ID from the authentication service.
   * If no user is logged in, an error message will be displayed and the dialog will be closed.
   * @throws {Error} If the user is not logged in.
   */
  ngOnInit(): void {
    try {
      this.uid = this.authService.getUid();
      if (!this.uid) {
        throw new Error('No user is currently logged in.');
      }
    } catch (error) {
      console.error(error);
      this.openMessageDialog(
        'Error',
        'You must be logged in to create a new account.'
      );
      this.closeDialog();
    }
  }

  /**
   * Creates a new account (or "pocket") for the logged-in user by calling the accountService.
   * The user must be logged in, and the account must have a positive balance and a valid name.
   * If these conditions are not met, an error message is shown.
   * @returns {Promise<void>} A promise that resolves when the account is successfully created.
   * @throws {Error} If the account creation fails.
   */
  async createAccount(): Promise<void> {
    if (!this.uid) {
      this.openMessageDialog(
        'Error',
        'You must be logged in to create an account.'
      );
      return;
    }

    if (this.account.balance <= 0 || !this.account.accountName) {
      this.openMessageDialog('Error', 'Please enter valid account details.');
      return;
    }

    this.account.userId = this.uid;

    try {
      await this.accountService.addAccount(this.uid, this.account.toJson());
      this.dialogRef.close(true);
    } catch (error) {
      this.openMessageDialog('Error', 'Failed to create account.');
    }
  }

  /**
   * Closes the dialog without making any changes.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Opens a message dialog to display an error or informational message to the user.
   * @param {string} title - The title of the message dialog.
   * @param {string} message - The message to display in the dialog.
   */
  openMessageDialog(title: string, message: string): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message },
    });
  }
}
