import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardActions } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [
      MatDialogModule,
      MatButtonModule,
      MatDialogActions,
      CommonModule
    ],
  template: `
    <h2 mat-dialog-title [ngClass]="data.type">{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close(false)" *ngIf="data.type === 'confirm'">Cancel</button>
      <button mat-raised-button [ngClass]="buttonClass" (click)="close(true)">{{ buttonText }}</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {
  buttonText: string;
  buttonClass: string;

  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; type: 'error' | 'warning' | 'confirm' | 'info' }
  ) {
    this.buttonText = this.getButtonText(data.type);
    this.buttonClass = this.getButtonClass(data.type);
  }

  getButtonText(type: string): string {
    switch (type) {
      case 'error':
        return 'OK';
      case 'warning':
        return 'OK';
      case 'confirm':
        return 'Confirm';
      case 'info':
      default:
        return 'OK';
    }
  }

  getButtonClass(type: string): string {
    switch (type) {
      case 'error':
        return 'error-button';
      case 'warning':
        return 'warning-button';
      case 'confirm':
        return 'confirm-button';
      case 'info':
      default:
        return 'info-button';
    }
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
