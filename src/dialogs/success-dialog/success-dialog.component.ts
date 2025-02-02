import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [MatDialogModule,
      // MatDialogClose,
      MatFormFieldModule,
      
      MatInputModule,
      MatDatepickerModule,
      MatButtonModule,
      FormsModule],
  templateUrl: './success-dialog.component.html',
  styleUrl: './success-dialog.component.scss'
})
export class SuccessDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SuccessDialogComponent>,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  goToLogin(): void {
    this.dialogRef.close();
    this.dialog.open(LoginComponent);
  }
}
