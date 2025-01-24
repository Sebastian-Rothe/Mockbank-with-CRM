import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, ],
  templateUrl: './transfer-detail.component.html',
  styleUrl: './transfer-detail.component.scss',
})
export class TransferDetailComponent {
  transferId: string | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<TransferDetailComponent>) {}

  closeDialog(): void {
    this.dialogRef.close(); 
  }
}
