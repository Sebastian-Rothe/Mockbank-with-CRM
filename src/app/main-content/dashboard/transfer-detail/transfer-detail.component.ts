import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Transfer } from '../../../models/transfer.class';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';

import { SharedService } from '../../../services/shared.service';
import { UserService } from '../../../services/user.service';
import { TransferService } from '../../../services/transfer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Observable, map, from } from 'rxjs';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    // MatMenu,
    MatIcon,
    MatMenuModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './transfer-detail.component.html',
  styleUrl: './transfer-detail.component.scss',
})
export class TransferDetailComponent {
  transfer: Transfer;
  bankAccountId: string = 'ACC-1738235430074-182';

  uid$: Observable<string | null>; // ✅ UID als Observable
  senderName: string = 'loading...';  // Direkt als String speichern
  receiverName: string = 'loading...'; 
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Transfer,
    public dialogRef: MatDialogRef<TransferDetailComponent>,
    private sharedService: SharedService,
    private authService: FirebaseAuthService, // ✅ AuthService nutzen
    private snackBar: MatSnackBar,
    private userService: UserService,
    private transferService: TransferService
  ) {
    this.transfer = data;
    this.uid$ = this.authService.uid$; // ✅ UID aus dem AuthService holen

  }
  async ngOnInit() {
    if (this.data.senderUserId) {
      const sender = await this.userService.getUser(this.data.senderUserId);
      this.senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Unbekannt';
    } else {
      this.senderName = 'Unbekannt';
    }

    if (this.data.receiverUserId) {
      const receiver = await this.userService.getUser(this.data.receiverUserId);
      this.receiverName = receiver ? `${receiver.firstName} ${receiver.lastName}` : 'Unbekannt';
    } else {
      this.receiverName = 'Unbekannt';
    }
  }
  getFormattedDate(transferDate: number): string {
    return this.sharedService.formatTimestampToDetailedDate(transferDate);
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

  async deleteTransfer(transferId: string): Promise<void> {
    try {
      // Call the deleteTransfer function from the service
      await this.transferService.deleteTransfer(transferId);

      // Optional: Display a notification for successful deletion
      this.snackBar.open('Transfer successfully deleted!', 'Close', {
        duration: 3000,
      });
      this.closeDialog();
    } catch (error) {
      // Handle errors
      console.error('Error while deleting the transfer:', error);
      this.snackBar.open('Failed to delete the transfer!', 'Close', {
        duration: 3000,
      });
    }
  }
  getFormattedCurrency(value: number) {
    return this.sharedService.getFormattedCurrency(value);
  }
  isBankAccount(accountId: string): boolean {
    return accountId === this.bankAccountId;
  }
}
