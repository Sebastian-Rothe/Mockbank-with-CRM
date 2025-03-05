import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Account } from '../../models/account.class';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { AccountService } from '../../services/account.service';
@Component({
  selector: 'app-dialog-edit-account',
  standalone: true,
  imports: [MatFormFieldModule, FormsModule, MatButtonModule, MatInput, MatDialogModule, MatIcon],
  templateUrl: './dialog-edit-account.component.html',
  styleUrl: './dialog-edit-account.component.scss',
})
export class DialogEditAccountComponent {
  account = new Account();
  AccountId: string = '';

  constructor(
    private accountService: AccountService,
    public dialogRef: MatDialogRef<DialogEditAccountComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { accountID: string }
  ) {
    this.AccountId = data.accountID; // Speichern der übergebenen ID
 
  }

  ngOnInit(): void {
    // Laden der Account-Daten
    this.accountService.getAccount(this.AccountId).then((accountData) => {
      if (accountData) {
        this.account = { ...accountData, accountId: this.AccountId }; // Daten in das Account-Objekt laden
      }
    }).catch((error) => {
      console.error('Error loading account data:', error);
    });
  }
  saveChanges(): void {
    // Speichern der Änderungen
    this.accountService.updateAccount(this.AccountId, this.account).then(() => {
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
