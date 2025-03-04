import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
//  material
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
//  services 
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { SnackbarService } from '../../services/snackbar.service';
import { DialogService } from '../../services/dialog.service';

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
   * @param {DialogService} dialogService - Service to manage dialog interactions.
   */
  constructor(
    private dialogRef: MatDialogRef<DialogEditUserEmailComponent>,
    private authService: FirebaseAuthService,
    private snackbarService: SnackbarService,
    private dialogService: DialogService
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
      this.dialogService.openDialog('Verification Email Sent', 'A verification email has been sent. Please confirm your new email.'); // msg
      const isVerified = await this.authService.checkEmailVerification();

      if (isVerified) {
        await this.authService.updateEmail(this.newEmail, this.currentPassword);
        this.snackbarService.success('Email successfully changed!'); // snack
        this.dialogRef.close();
      } else {
        this.snackbarService.error('Email was not verified.'); // snack
      }
    } catch (error: any) {
      this.dialogService.openDialog('Error', 'Error changing email: ' + error.message); // msg
    }
  }

  /**
   * Closes the dialog without making any changes.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
