import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardActions } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { FormsModule } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDialog, MatDialogContent } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIcon } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [
      MatDialogModule,
      // MatFormFieldModule,
      // MatInputModule,
      MatButtonModule,
      MatDialogActions,
      // FormsModule,
      // MatIcon
    ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)">Cancel</button>
      <button mat-raised-button class='confirm-button' (click)="close(true) ">OK</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
