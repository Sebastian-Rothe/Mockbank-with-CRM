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
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-dialog-sent-money',
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
  templateUrl: './dialog-send-money.component.html',
  styleUrl: './dialog-send-money.component.scss',
})
export class DialogSendMoneyComponent {
  uid: string | null = null; // User-ID
  user: User | null = null;
  transfer = new Transfer(); // Neuer Transfer
  totalBalance: number = 0; // Gesamtsumme der Konten
  userAccounts: Account[] = []; // Array von Account-Objekten, statt nur einem Account-Objekt
  users: User[] = [];
  selectedUser: User | null = null;
  selectedAccount: Account | null = null;
  senderAccountId: string; //

  constructor(
    private firebaseService: FirebaseService,
    private authService: FirebaseAuthService,
    public dialogRef: MatDialogRef<DialogSendMoneyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { senderAccountId: string }
  ) {
    this.firebaseService.getUsers().subscribe((users) => {
      this.users = users;
      console.log('Users:', this.users);
    });
    this.senderAccountId = data.senderAccountId; // Speichern der übergebenen ID
    console.log('Sender Account ID in Dialog:', this.senderAccountId);
  }

  ngOnInit(): void {
    this.uid = this.authService.getUid();
    console.log('Current UID:', this.uid);
    if (this.users.length > 0) {
      this.selectedUser = this.users.find(user => user.uid === this.uid) || null;
      console.log('Selected user on init:', this.selectedUser);
    }
  }

  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.firebaseService.getUser(uid);
      console.log('Loaded user:', this.user);

      if (this.user && this.user.accounts.length > 0) {
        await this.loadAccounts(this.user.accounts);
        await this.loadFirstAccountsFromAllUsers();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  async loadAccounts(accountIds: string[]): Promise<void> {
    if (!accountIds || accountIds.length === 0) {
      console.error('No accounts to load.');
      return;
    }
  
    try {
      const accounts = await Promise.all(
        accountIds.map(async (accountId) => {
          const accountData = await this.firebaseService.getAccount(accountId);
          return Account.fromJson(accountData); // Umwandlung in Account-Objekt
        })
      );
  
      this.userAccounts = accounts; // Speichere die geladenen Konten
      console.log('Loaded accounts:', this.userAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }
  
  
  async loadFirstAccountsFromAllUsers(): Promise<void> {
    try {
      const users = await this.firebaseService.getAllUsers();

      const firstAccounts = await Promise.all(
        users
          .filter((user) => user.accounts && user.accounts.length > 0)
          .map(async (user) => {
            const firstAccountId = user.accounts[0];
            const accountData = await this.firebaseService.getAccount(
              firstAccountId
            );
            return Account.fromJson(accountData);
          })
      );
      this.userAccounts = firstAccounts;

      console.log('First accounts loaded:', this.userAccounts);
      console.log('', users);
    } catch (error) {
      console.error('Error loading first accounts from all users:', error);
    }
  }

  onUserSelect(userId: string): void {
    console.log("Selected user UID:", userId);  // Konsolenausgabe für Debugging
    this.selectedUser = this.users.find(user => user.uid === userId) || null;
    console.log("Selected user:", this.selectedUser);  // Konsolenausgabe für Debugging
  
    if (this.selectedUser) {
      this.loadAccounts(this.selectedUser.accounts);
    } else {
      this.userAccounts = [];
    }
  }
  
  
  

  sendMoney(): void {
    if (this.senderAccountId && this.transfer.receiverAccountId) {
      this.firebaseService
        .transferFunds(
          this.senderAccountId,
          this.transfer.receiverAccountId,
          this.transfer.amount,
          this.transfer.description
        )
        .then(() => {
          console.log('Money transferred successfully.');
          this.closeDialog();
        })
        .catch((error) => {
          console.error('Transfer failed:', error);
        });
    } else {
      console.error('Sender or receiver account ID missing.');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
