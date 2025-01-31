import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

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
  newEmail: string = '';
  currentPassword: string = '';

  constructor(
    private dialogRef: MatDialogRef<DialogEditUserEmailComponent>,
    private authService: FirebaseAuthService
  ) {}

  async changeEmail(): Promise<void> {
    try {
      await this.authService.reauthenticate(this.currentPassword);
      await this.authService.sendEmailVerification();
      alert('Eine Verifizierungs-E-Mail wurde gesendet. Bitte bestätigen Sie Ihre neue E-Mail.');
      const isVerified = await this.authService.checkEmailVerification();

      if (isVerified) {
        await this.authService.updateEmail(this.newEmail, this.currentPassword);
        alert('E-Mail erfolgreich geändert!');
        this.dialogRef.close();
      } else {
        alert('E-Mail wurde nicht verifiziert.');
      }
    } catch (error: any) {
      alert('Fehler beim Ändern der E-Mail: ' + error.message);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
