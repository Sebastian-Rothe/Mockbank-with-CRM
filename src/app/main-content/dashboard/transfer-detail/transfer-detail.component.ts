import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Transfer } from '../../../../models/transfer.class';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions],
  templateUrl: './transfer-detail.component.html',
  styleUrl: './transfer-detail.component.scss',
})
export class TransferDetailComponent {
  transferId: string | null = null;
  transfer: Transfer;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Transfer,
    public dialogRef: MatDialogRef<TransferDetailComponent>
  ) {
    this.transfer = data;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
