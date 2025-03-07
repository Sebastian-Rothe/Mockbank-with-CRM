import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../dialogs/message-dialog/message-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Opens a dialog with a given title, message, and type.
   * @param {string} title - The title of the dialog.
   * @param {string} message - The message to display in the dialog.
   * @param {'error' | 'warning' | 'confirm' | 'info'} [type='info'] - The type of the dialog.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the dialog is confirmed, otherwise `false`.
   */
  openDialog(title: string, message: string, type: 'error' | 'warning' | 'confirm' | 'info' = 'info'): Promise<boolean> {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '400px',
      data: { title, message, type },
    });

    return dialogRef.afterClosed().toPromise();
  }
}
