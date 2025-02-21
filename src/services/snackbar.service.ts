import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  showMessage(message: string, action: string = 'OK', duration: number = 3000, panelClass: string = 'info') {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass],  // Klasse für Styles
    });
  }

  success(message: string) {
    this.showMessage(message, 'OK', 3000, 'success');
  }

  error(message: string) {
    this.showMessage(message, 'OK', 5000, 'error');
  }

  warning(message: string) {
    this.showMessage(message, 'OK', 4000, 'warning');
  }

  info(message: string) {
    this.showMessage(message, 'OK', 3000, 'info');
  }
}
