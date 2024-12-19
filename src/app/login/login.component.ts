import { Component, ChangeDetectionStrategy } from '@angular/core';
import { inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { User } from '../../models/user.class';
import { FirebaseService } from '../../services/firebase.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,

    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: FirebaseAuthService,
    public dialogRef: MatDialogRef<LoginComponent>
  ) {}

  async login(): Promise<void> {
    try {
      await this.authService.login(this.email, this.password);
      this.dialogRef.close(); // Schließt den Dialog nach erfolgreicher Anmeldung
    } catch (error: any) {
      this.errorMessage = error.message; // Zeigt Fehlermeldungen an
    }
  }

  cancel(): void {
    this.dialogRef.close(); // Schließt den Dialog ohne Aktion
  }
}
