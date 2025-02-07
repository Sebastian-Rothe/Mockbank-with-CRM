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
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { Router } from '@angular/router';
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
    private router: Router,
    private authService: FirebaseAuthService,
    public dialogRef: MatDialogRef<LoginComponent>
  ) {}

  async login(): Promise<void> {
    try {
      const user = await this.authService.login(this.email, this.password);

      if (user) {
        // Weiterleitung mit UID als Query-Parameter
        this.router.navigate(['main'], { queryParams: { uid: user.uid } });
        console.log(user.uid);
        this.cancel();
      }
    } catch (error: any) {
      this.errorMessage = error.message; // Zeigt Fehlermeldungen an
    }
  }
  loginAsGuest() {
    const user = this.authService.guestLogin()
    if (user) {
      // Weiterleitung mit UID als Query-Parameter
      this.router.navigate(['main'], { queryParams: { uid: user } });
      console.log(user);
      this.cancel();
    }
      // .then(user => console.log('Gast-Login erfolgreich:', user))
      // .catch(error => console.error('Fehler beim Gast-Login:', error));
  }

  cancel(): void {
    this.dialogRef.close(); // Schließt den Dialog ohne Aktion
  }
}
