import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// services
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedService } from '../../../services/shared.service';
// models
import { User } from '../../../models/user.class';
import { Account } from '../../../models/account.class';
// material
import { MatDialog } from '@angular/material/dialog';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
// components
import { DialogSendMoneyComponent } from '../../../dialogs/dialog-send-money/dialog-send-money.component';
import { DialogOpenNewPocketComponent } from '../../../dialogs/dialog-open-new-pocket/dialog-open-new-pocket.component';
import { DialogMoveMoneyComponent } from '../../../dialogs/dialog-move-money/dialog-move-money.component';
import { DialogEditAccountComponent } from '../../../dialogs/dialog-edit-account/dialog-edit-account.component';
import { DialogConfirmDeleteAccComponent } from '../../../dialogs/dialog-confirm-delete-acc/dialog-confirm-delete-acc.component';
import { TransfersComponent } from './transfers/transfers.component';
import { BankComponent } from '../bank/bank.component';
// charts
import { FirstChartsComponent } from '../../../charts/first-charts/first-charts.component';
import { MonthlyExpensesChartComponent } from '../../../charts/first-charts/monthly-expenses-chart/monthly-expenses-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCard,
    MatIconModule,
    MatCardContent,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatIcon,
    CommonModule,
    MatMenu,
    TransfersComponent,
    FirstChartsComponent, // first charts component
    MonthlyExpensesChartComponent,
    BankComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  uid: string = ''; // UID des Benutzers
  user: User | null = null; // Benutzerdaten
  totalBalance: number = 0; // Gesamtsumme der Konten
  userAccounts: Account[] = []; // Array von Account-Objekten, statt nur einem Account-Objekt
  transfers: any[] = []; // Eine Liste für die Transfers des Benutzers
  profilePictureUrl: string = ''; // URL des Profilbilds
  isImageSelected = false; // Status, ob ein Bild ausgewählt wurde
  constructor(
    private sharedService: SharedService,
    private authService: FirebaseAuthService,
    private firebaseService: FirebaseService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // Auf UID-Änderungen reagieren
    this.authService.uid$.subscribe((uid) => {
      console.log('Aktuelle UID:', uid);
      if (uid) {
        this.uid = uid; // UID setzen
        this.loadUser(uid); // Daten laden
      }
    });
  }

  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.firebaseService.getUser(uid);
      // console.log('Loaded user:', this.user);

      if (this.user && this.user.accounts.length > 0) {
        await this.loadAccounts(this.user.accounts);
        await this.loadTransfers();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  // async loadAccounts(accountIds: string[]): Promise<void> {
  //   try {
  //     const accounts = await Promise.all(
  //       accountIds.map(async (accountId) => {
  //         const accountData = await this.firebaseService.getAccount(accountId);
  //         return Account.fromJson(accountData); // Umwandlung in Account-Objekt mit fromJson
  //       })
  //     );

  //     this.userAccounts = accounts;
  //     this.totalBalance = accounts.reduce(
  //       (sum, account) => sum + account.balance,
  //       0
  //     );
  //     console.log('Total Balance:', this.totalBalance);
  //   } catch (error) {
  //     console.error('Error loading accounts:', error);
  //   }
  // }
  async loadAccounts(accountIds: string[]): Promise<void> {
    try {
      const accounts = await Promise.all(
        accountIds.map((accountId) =>
          this.firebaseService.getAccount(accountId)
        )
      );
      this.userAccounts = accounts.map(Account.fromJson);
      this.totalBalance = this.userAccounts.reduce(
        (sum, account) => sum + account.balance,
        0
      );
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }

  async loadTransfers(): Promise<void> {
    try {
      if (this.user) {
        const transfers = await this.firebaseService.getTransfersForUser(
          this.user
        );

        this.transfers = [];

        // Für jeden Transfer erstellen wir zwei Einträge: einen als "sent" und einen als "received".
        for (const transfer of transfers) {
          const isSender = this.userAccounts.some(
            (account) => account.accountId === transfer.senderAccountId
          );

          const isReceiver = this.userAccounts.some(
            (account) => account.accountId === transfer.receiverAccountId
          );

          // Überprüfen, ob der Transfer bereits hinzugefügt wurde
          const exists = this.transfers.some(
            (t) => t.transferId === transfer.transferId
          );

          if (!exists) {
            if (isSender) {
              this.transfers.push({
                ...transfer,
                amount: -transfer.amount, // Negativ für "sent"
                type: 'sent',
              });
            }

            if (isReceiver) {
              this.transfers.push({
                ...transfer,
                amount: transfer.amount, // Positiv für "received"
                type: 'received',
              });
            }
          }
        }

        this.transfers.sort((a, b) => b.createdAt - a.createdAt);

        console.log('Processed transfers:', this.transfers);
      } else {
        console.error('User is null');
      }
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  }

  openSendMoneyDialog(accountId: string): void {
    const dialogRef = this.dialog.open(DialogSendMoneyComponent, {
      data: { senderAccountId: accountId }, // Übergabe der Account-ID
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Accounts oder Transfers neu laden
        this.loadUser(this.uid); // Oder: this.loadTransfers();
      }
    });
  }

  openNewPocketDialog(): void {
    const dialogRef = this.dialog.open(DialogOpenNewPocketComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Accounts neu laden, wenn ein neues Konto erstellt wurde
        this.loadUser(this.uid); // Oder: this.loadAccounts(this.user?.accounts || []);
      }
    });
  }

  openMoveMoneyDialog(accountId: string): void {
    const dialogRef = this.dialog.open(DialogMoveMoneyComponent, {
      data: { senderAccountId: accountId }, // Übergabe der Account-ID
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Accounts oder Transfers neu laden, wenn Geld verschoben wurde
        this.loadUser(this.uid); // Oder: this.loadTransfers();
      }
    });
  }

  getFormattedDate(transferDate: number): string {
    let date: number = transferDate;
    return this.sharedService.formatTimestampToDate(date);
  }
  
  editAccount(accountID: string): void {
    const dialogRef = this.dialog.open(DialogEditAccountComponent, {
      data: { accountID: accountID }, // Übergabe der Account-ID
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Accounts neu laden, wenn Änderungen vorgenommen wurden
        this.loadUser(this.uid); // Oder: this.loadAccounts(this.user?.accounts || []);
        console.log("thank you");
        
      }
    });
  }

  deleteAccount(accountId: string, userId: string): void {
    const dialogRef = this.dialog.open(DialogConfirmDeleteAccComponent, {
      width: '400px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the account with ID ${accountId}? The money in the account will be lost.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // Lösche das Konto aus der Account-Sammlung
        this.firebaseService
          .deleteAccount(accountId)
          .then(() => {
            // Entferne die accountId aus dem Benutzerobjekt
            return this.firebaseService.removeAccountFromUser(
              userId,
              accountId
            );
          })
          .then(() => {
            console.log('Account deleted and removed from user successfully');
            return this.loadUser(this.uid); 
          })
          .catch((error) => {
            console.error('Error deleting account:', error);
          });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isImageSelected = true;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      alert('Bitte laden Sie eine gültige Bilddatei hoch (jpg, png).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePictureUrl = reader.result as string;
      if (this.user) {
        this.user.profilePictureUrl = this.profilePictureUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Speichert das Profilbild des Benutzers.
   */
  async saveProfilePicture(): Promise<void> {
    const userId = this.uid;
    if (this.user?.profilePictureUrl) {
      // Greife auf `this.user.profilePictureUrl` zu
      try {
        await this.firebaseService.updateUserProfilePicture(
          userId,
          this.user.profilePictureUrl
        );
      } catch (error) {
        console.error('Fehler beim Speichern des Profilbilds:', error);
      }
    } else {
      alert('Bitte zuerst ein Bild auswählen.');
    }
    this.isImageSelected = false;
  }
}
