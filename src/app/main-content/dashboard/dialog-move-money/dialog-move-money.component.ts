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
import { FirebaseService } from '../../../../services/firebase.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';


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
    uid: string | null = null; // User-ID
    user: User | null = null;
    account: Account = new Account(); // Neues Konto
    transfer = new Transfer(); // Neuer Transfer  
    totalBalance: number = 0; // Gesamtsumme der Konten
    userAccounts: Account[] = []; // Array von Account-Objekten, statt nur einem Account-Objekt
  
    
    constructor(
      private firebaseService: FirebaseService,
      private authService: FirebaseAuthService,
      public dialogRef: MatDialogRef<DialogMoveMoneyComponent>
     
    ) {}
  
    ngOnInit(): void {
      this.uid = this.authService.getUid();
      console.log('Current UID:', this.uid);
      if (this.uid) {
        this.loadUser(this.uid);
      }
    }
  
    async loadUser(uid: string): Promise<void> {
      try {
        this.user = await this.firebaseService.getUser(uid);
        console.log('Loaded user:', this.user);
  
        if (this.user && this.user.accounts.length > 0) {
          await this.loadAccounts(this.user.accounts);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    async loadAccounts(accountIds: string[]): Promise<void> {
      try {
        const accounts = await Promise.all(
          accountIds.map(async (accountId) => {
            const accountData = await this.firebaseService.getAccount(accountId);
            return Account.fromJson(accountData);  // Umwandlung in Account-Objekt mit fromJson
          })
        );
  
        this.userAccounts = accounts;
        this.totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
        console.log('Total Balance:', this.totalBalance);
      } catch (error) {
        console.error('Error loading accounts:', error);
      }
    }

moveMoney(): void {
    // Hier wird der Code zum Senden des Geldes eingefügt
    this.closeDialog();
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}

//  this c does not know how the user is!!!
