import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Account } from '../../models/account.class';
import { FirebaseService } from '../../services/firebase.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { MatIcon } from '@angular/material/icon';

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
    MatIcon
  ],
  templateUrl: './dialog-open-new-pocket.component.html',
  styleUrls: ['./dialog-open-new-pocket.component.scss'],
})
export class DialogOpenNewPocketComponent implements OnInit {
  uid: string | null = null; // User-ID
  account: Account = new Account(); // Neues Konto

  constructor(
    private firebaseService: FirebaseService,
    private authService: FirebaseAuthService,
    public dialogRef: MatDialogRef<DialogOpenNewPocketComponent>
  ) {}

  ngOnInit(): void {
    try {
      this.uid = this.authService.getUid(); // Benutzer-ID abrufen
      if (!this.uid) {
        throw new Error('No user is currently logged in.');
      }
    } catch (error) {
      console.error(error);
      alert('You must be logged in to create a new account.');
      this.closeDialog();
    }
  }

  /**
   * Erstellt ein neues Konto und speichert es in Firebase
   */
  async createAccount(): Promise<void> {
    if (!this.uid) {
      console.error('No user ID found.');
      alert('You must be logged in to create an account.');
      return;
    }

    // Validierung der Kontodetails
    if (this.account.balance <= 0) {
      alert('Please enter valid account details.');
      return;
    }

    // Benutzer-ID setzen
    this.account.userId = this.uid;

    try {
      // Konto in Firebase hinzufügen
      await this.firebaseService.addAccount(this.uid, this.account.toJson());
      this.dialogRef.close(true); // Dialog schließen mit Erfolg
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account.');
    }
  }

  /**
   * Schließt den Dialog
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
