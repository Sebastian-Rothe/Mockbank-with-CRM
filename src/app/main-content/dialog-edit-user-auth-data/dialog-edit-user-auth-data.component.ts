import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-dialog-edit-user-auth-data',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './dialog-edit-user-auth-data.component.html',
  styleUrl: './dialog-edit-user-auth-data.component.scss'
})
export class DialogEditUserAuthDataComponent {
  user = new User();
  newEmail: string = '';
  newPassword: string = '';
  currentPassword: string = ''; // Für die Reauthentifizierung

  constructor(
    private dialogRef: MatDialogRef<DialogEditUserAuthDataComponent>,
    private authService: FirebaseAuthService
  ) {}

  /**
   * Aktualisiert die E-Mail des Benutzers.
   */
// async changeEmail(): Promise<void> {
//   try {
//     // Schritt 1: Benutzer reauthentifizieren
//     await this.authService.reauthenticate(this.currentPassword);

//     // Schritt 2: Verifizierungs-E-Mail senden
//     await this.authService.sendEmailVerification();
//     alert('Eine Verifizierungs-E-Mail wurde an die neue Adresse gesendet. Bitte überprüfen Sie diese, bevor Sie die Änderung vornehmen.');

//     // Schritt 3: Warte, bis die E-Mail bestätigt wurde (manuell oder mit einem weiteren Schritt im Backend)
//     console.log('Bitte warten Sie, bis die neue E-Mail-Adresse bestätigt wurde.');
//   } catch (error: any) {
//     alert('Fehler beim Aktualisieren der E-Mail: ' + error.message);
//   }
// }

  
  async changePassword(): Promise<void> {
    try {
      await this.authService.reauthenticate(this.currentPassword); // Nur das Passwort übergeben
      await this.authService.updatePassword(this.newPassword);
      alert('Passwort erfolgreich aktualisiert!');
      this.dialogRef.close();
    } catch (error: any) {
      alert('Fehler beim Aktualisieren des Passworts: ' + error.message);
    }
  }
  

  /**
   * Dialog schließen.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
  async changeEmail(): Promise<void> {
    try {
      // Schritt 1: Benutzer reauthentifizieren
      await this.authService.reauthenticate(this.currentPassword);
  
      // Schritt 2: Verifizierungs-E-Mail senden
      await this.authService.sendEmailVerification();
      alert(
        'Eine Verifizierungs-E-Mail wurde an die neue Adresse gesendet. Bitte überprüfen Sie diese, bevor Sie die Änderung vornehmen.'
      );
  
      // Schritt 3: Überprüfen, ob die E-Mail bestätigt wurde
      const interval = setInterval(async () => {
        const isVerified = await this.authService.checkEmailVerification();
        if (isVerified) {
          clearInterval(interval);
          clearTimeout(timeout); // Timeout abbrechen
  
          try {
            // Schritt 4: E-Mail-Adresse aktualisieren (nur wenn die E-Mail verifiziert ist)
            await this.authService.updateEmail(this.newEmail, this.currentPassword);
            alert('E-Mail erfolgreich bestätigt und aktualisiert!');
            this.dialogRef.close();
          } catch (updateError: any) {
            alert(
              'E-Mail konnte nicht aktualisiert werden: ' + updateError.message
            );
          }
        }
      }, 5000); // Alle 5 Sekunden prüfen
  
      // Timeout für das Polling
      const timeout = setTimeout(() => {
        clearInterval(interval);
        alert('Die Verifizierung hat zu lange gedauert. Bitte erneut versuchen.');
      }, 60000); // Timeout nach 60 Sekunden
    } catch (error: any) {
      alert('Fehler beim Aktualisieren der E-Mail: ' + error.message);
    }
  }
  
  
  
}
