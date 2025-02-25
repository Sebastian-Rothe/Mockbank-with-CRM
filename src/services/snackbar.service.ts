import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Displays a snackbar message with customizable options.
   * @param {string} message - The message to display.
   * @param {string} [action='OK'] - The label for the action button.
   * @param {number} [duration=3000] - Duration in milliseconds before the snackbar disappears.
   * @param {string} [panelClass='info'] - CSS class to style the snackbar (e.g., 'success', 'error', 'warning', 'info').
   */
  showMessage(
    message: string,
    action: string = 'OK',
    duration: number = 3000,
    panelClass: string = 'info'
  ): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass], // Class for styling
    });
  }

  /**
   * Displays a success message with a predefined style.
   * @param {string} message - The success message to display.
   */
  success(message: string): void {
    this.showMessage(message, 'OK', 3000, 'success');
  }

  /**
   * Displays an error message with a predefined style.
   * @param {string} message - The error message to display.
   */
  error(message: string): void {
    this.showMessage(message, 'OK', 5000, 'error');
  }

  /**
   * Displays a warning message with a predefined style.
   * @param {string} message - The warning message to display.
   */
  warning(message: string): void {
    this.showMessage(message, 'OK', 4000, 'warning');
  }

  /**
   * Displays an informational message with a predefined style.
   * @param {string} message - The informational message to display.
   */
  info(message: string): void {
    this.showMessage(message, 'OK', 3000, 'info');
  }
}
