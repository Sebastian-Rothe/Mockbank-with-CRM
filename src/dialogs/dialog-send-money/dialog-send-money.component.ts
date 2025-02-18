import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
// Material Design
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
// modules
import { Transfer } from '../../models/transfer.class';
import { User } from '../../models/user.class';
import { Account } from '../../models/account.class';
// Firebase Services
import { FirebaseService } from '../../services/firebase.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { AccountService } from '../../services/account.service';

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
    MatIcon,
  ],
  templateUrl: './dialog-send-money.component.html',
  styleUrl: './dialog-send-money.component.scss',
})
export class DialogSendMoneyComponent {
  uid: string | null = null;
  user: User | null = null;
  users: User[] = [];
  userAccounts: Account[] = [];
  transfer = new Transfer();
  totalBalance: number = 0;
  selectedUser: string | null = null;
  senderAccountId: string;
  categories: string[] = [
    'Groceries',
    'Rent',
    'Utilities',
    'Transportation',
    'Dining',
    'Shopping',
    'Health',
    'Entertainment',
    'Travel',
    'Education',
    'Investments',
    'Insurance',
    'Gifts',
    'Donations',
    'Subscriptions',
    'Others',
  ];

  constructor(
    private firebaseService: FirebaseService,
    private authService: FirebaseAuthService,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<DialogSendMoneyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { senderAccountId: string }
  ) {
    this.firebaseService.getUsers().subscribe((users) => {
      this.users = users;
   
    });
    this.senderAccountId = data.senderAccountId; // Speichern der übergebenen ID
  
  }

  ngOnInit(): void {
    this.uid = this.authService.getUid();

    if (this.uid) {
      this.loadUser(this.uid);
    }
  }

  // if (this.users.length > 0) {
  //   this.selectedUser = this.users.find(user => user.uid === this.uid) || null;
  //   console.log('Selected user on init:', this.selectedUser);
  // }

  async loadUser(uid: string): Promise<void> {
    try {
      // this.user = await this.firebaseService.getUser(uid);
     

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
          const accountData = await this.accountService.getAccount(accountId);
          return Account.fromJson(accountData); // Umwandlung in Account-Objekt
        })
      );

      this.userAccounts = accounts; // Speichere die geladenen Konten
    
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
            const accountData = await this.accountService.getAccount(
              firstAccountId
            );
            return Account.fromJson(accountData);
          })
      );
      this.userAccounts = firstAccounts;

    } catch (error) {
      console.error('Error loading first accounts from all users:', error);
    }
  }

  onUserSelect(userId: string): void {
    console.log('Selected user UID:', userId);
    this.selectedUser = userId;
    const user = this.users.find((user) => user.uid === userId);
    console.log('Selected user:', user);

    if (user) {
      this.loadAccounts(user.accounts);
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
          this.transfer.description,
          this.transfer.category
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
