import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Transfer } from '../../../../models/transfer.class';
import { User } from '../../../../models/user.class';
import { Account } from '../../../../models/account.class';

@Component({
  selector: 'app-dialog-move-money',
  standalone: true,
  imports: [
    MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,
    MatOption,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './dialog-move-money.component.html',
  styleUrl: './dialog-move-money.component.scss',
})
export class DialogMoveMoneyComponent {
transfer = new Transfer(); // Neuer Transfer
// accounts = new Account(); // Neues Konto
user = new User(); // Neuer Benutzer
  constructor(public dialogRef: MatDialogRef<DialogMoveMoneyComponent>) {} // Methode zum Senden des Geldes

moveMoney(): void {
    // Hier wird der Code zum Senden des Geldes eingefügt
    this.closeDialog();
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}

//  this c does not know how the user is!!!
