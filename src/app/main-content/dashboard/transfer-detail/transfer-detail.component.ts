import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Transfer } from '../../../../models/transfer.class';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { FirebaseService

 } from '../../../../services/firebase.service';
@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions],
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
    private firebaseService: FirebaseService
  ) {
    this.transfer = data;
  }

  async ngOnInit(): Promise<void> {
    try {
      // Holen der Sender-Daten
      if (this.transfer.senderUserId) {
        const sender = await this.firebaseService.getUser(this.transfer.senderUserId);
        this.senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Unbekannt';
      }

      // Holen der Empfänger-Daten
      if (this.transfer.receiverUserId) {
        const receiver = await this.firebaseService.getUser(this.transfer.receiverUserId);
        this.receiverName = receiver ? `${receiver.firstName} ${receiver.lastName}` : 'Unbekannt';
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der User-Daten:', error);
    }
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
