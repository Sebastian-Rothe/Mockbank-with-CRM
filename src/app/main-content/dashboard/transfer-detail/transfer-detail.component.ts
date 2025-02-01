import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Transfer } from '../../../../models/transfer.class';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedService } from '../../../../services/shared.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
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
  ],
  templateUrl: './transfer-detail.component.html',
  styleUrl: './transfer-detail.component.scss',
})
export class TransferDetailComponent {
  transfer: Transfer;
  senderName: string = ''; // Sender-Name
  receiverName: string = ''; // Empfänger-Name

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Transfer,
    public dialogRef: MatDialogRef<TransferDetailComponent>,
    private firebaseService: FirebaseService,
    private sharedService: SharedService,
    private snackBar: MatSnackBar // Optional
  ) {
    this.transfer = data;
  }

  async ngOnInit(): Promise<void> {
    try {
      // Holen der Sender-Daten
      if (this.transfer.senderUserId) {
        const sender = await this.firebaseService.getUser(
          this.transfer.senderUserId
        );
        this.senderName = sender
          ? `${sender.firstName} ${sender.lastName}`
          : 'Unbekannt';
      }

      // Holen der Empfänger-Daten
      if (this.transfer.receiverUserId) {
        const receiver = await this.firebaseService.getUser(
          this.transfer.receiverUserId
        );
        this.receiverName = receiver
          ? `${receiver.firstName} ${receiver.lastName}`
          : 'Unbekannt';
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der User-Daten:', error);
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
      await this.firebaseService.deleteTransfer(transferId);

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
}
