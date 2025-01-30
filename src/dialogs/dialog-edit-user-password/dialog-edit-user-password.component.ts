import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-dialog-edit-user-password',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './dialog-edit-user-password.component.html',
  styleUrls: ['./dialog-edit-user-password.component.scss'],
})
export class DialogEditUserPasswordComponent {
  currentPassword: string = '';
  newPassword: string = '';

  constructor(
    private dialogRef: MatDialogRef<DialogEditUserPasswordComponent>,
    private authService: FirebaseAuthService
  ) {}

  async changePassword(): Promise<void> {
    try {
      await this.authService.reauthenticate(this.currentPassword);
      await this.authService.updatePassword(this.newPassword);
      alert('Passwort erfolgreich geändert!');
      this.dialogRef.close();
    } catch (error: any) {
      alert('Fehler beim Ändern des Passworts: ' + error.message);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
