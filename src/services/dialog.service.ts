import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../dialogs/message-dialog/message-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '400px',
      data: { title, message },
    });

    return dialogRef.afterClosed().toPromise(); 
  }
}
