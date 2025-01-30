import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { Account } from '../../models/account.class';
import { MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../services/firebase.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatInput } from '@angular/material/input';
@Component({
  selector: 'app-dialog-edit-account',
  standalone: true,
  imports: [MatFormFieldModule, FormsModule, MatButtonModule, MatInput],
  templateUrl: './dialog-edit-account.component.html',
  styleUrl: './dialog-edit-account.component.scss',
})
export class DialogEditAccountComponent {
  account = new Account();
  AccountId: string = '';

  constructor(
    private firebaseService: FirebaseService,
    public dialogRef: MatDialogRef<DialogEditAccountComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { accountID: string }
  ) {
    this.AccountId = data.accountID; // Speichern der übergebenen ID
    console.log('Sender Account ID in Dialog:', this.AccountId);
  }

  ngOnInit(): void {
    // Laden der Account-Daten
    this.firebaseService.getAccount(this.AccountId).then((accountData) => {
      if (accountData) {
        this.account = { ...accountData, accountId: this.AccountId }; // Daten in das Account-Objekt laden
      }
    }).catch((error) => {
      console.error('Error loading account data:', error);
    });
  }
  saveChanges(): void {
    // Speichern der Änderungen
    this.firebaseService.updateAccount(this.AccountId, this.account).then(() => {
      console.log('Account successfully updated');
      this.dialogRef.close();
    }).catch((error) => {
      console.error('Error updating account:', error);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
