import { Component } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-dialog-confirm-delete-acc',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatButtonModule, MatIcon],
  templateUrl: './dialog-confirm-delete-acc.component.html',
  styleUrl: './dialog-confirm-delete-acc.component.scss'
})
export class DialogConfirmDeleteAccComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmDeleteAccComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
