import { Component } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { SnackbarService } from '../../services/snackbar.service';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

/**
 * DialogEditUserEmailComponent is responsible for handling the logic to open a dialog that allows a user
 * to change their email address. It includes validation of user input and interaction with the
 * Firebase authentication service to update the email. If the user is not authenticated or provides
 * invalid details, appropriate error messages will be shown.
 *
 * @component
 * @example
 * <app-dialog-edit-user-email></app-dialog-edit-user-email>
 */
@Component({
  selector: 'app-dialog-edit-user-email',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIcon
  ],
  templateUrl: './dialog-edit-user-email.component.html',
  styleUrls: ['./dialog-edit-user-email.component.scss'],
})
export class DialogEditUserEmailComponent {
  /**
   * The new email address to be set for the user.
   * @type {string}
   */
  newEmail: string = '';

  /**
   * The current password of the user for reauthentication.
   * @type {string}
   */
  currentPassword: string = '';

  /**
   * Creates an instance of DialogEditUserEmailComponent.
   * @param {MatDialogRef<DialogEditUserEmailComponent>} dialogRef - Reference to the current dialog instance.
   * @param {FirebaseAuthService} authService - Service to handle authentication operations.
   * @param {SnackbarService} snackbarService - Service to display snackbar messages.
   * @param {MatDialog} dialog - Service to manage dialog interactions.
   */
  constructor(
    private dialogRef: MatDialogRef<DialogEditUserEmailComponent>,
    private authService: FirebaseAuthService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) {}

  /**
   * Changes the email address of the user by reauthenticating and updating the email.
   * If the email verification is successful, the email is updated and a success message is shown.
   * If the email verification fails or any error occurs, an appropriate error message is shown.
   * @returns {Promise<void>} A promise that resolves when the email is successfully changed.
   * @throws {Error} If the email change fails.
   */
  async changeEmail(): Promise<void> {
    try {
      await this.authService.reauthenticate(this.currentPassword);
      await this.authService.sendEmailVerification();
      this.openMessageDialog('Verification Email Sent', 'A verification email has been sent. Please confirm your new email.'); // msg
      const isVerified = await this.authService.checkEmailVerification();

      if (isVerified) {
        await this.authService.updateEmail(this.newEmail, this.currentPassword);
        this.snackbarService.success('Email successfully changed!'); // snack
        this.dialogRef.close();
      } else {
        this.snackbarService.error('Email was not verified.'); // snack
      }
    } catch (error: any) {
      this.openMessageDialog('Error', 'Error changing email: ' + error.message); // msg
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
