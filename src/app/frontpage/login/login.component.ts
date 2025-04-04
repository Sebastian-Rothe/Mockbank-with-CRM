import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { User } from '../../models/user.class';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

interface GuestUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'guest';
  createdAt: number;
}

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
    private userService: UserService,
    public dialogRef: MatDialogRef<LoginComponent>
  ) {}

  async login(): Promise<void> {
    try {
      const user = await this.authService.login(this.email, this.password);

      if (user) {
        // Weiterleitung mit UID als Query-Parameter
        this.router.navigate(['main'], { queryParams: { uid: user.uid } });
        // console.log(user.uid);
        this.cancel();
      }
    } catch (error: any) {
      this.errorMessage = error.message; // Zeigt Fehlermeldungen an
    }
  }
  // Funktion für den Gast-Login
  async loginAsGuest(): Promise<void> {
    try {
      const userCredential = await this.authService.guestLogin();
      if (userCredential) {
        const uid = userCredential.user.uid;
    
        // Gast-User als User-Instanz erstellen
        const guestUser = new User({
          uid,
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@temporary.com',
          role: 'guest',
          createdAt: Date.now(),
          birthDate: 0, // oder ein anderes Standard-Datum
          streetAddress: '',
          zipCode: '',
          city: '',
          accounts: [],
        });
    
        // Speichern des Gast-Users in Firestore
        await this.userService.addUserWithAccount(guestUser);
    
        // Weiterleitung
        this.router.navigate(['main'], { queryParams: { uid: guestUser.uid } });
        this.cancel();
      }
    } catch (error) {
      console.error('Error at guest-login:', error);
    }
  }
  
  
  

  cancel(): void {
    this.dialogRef.close(); // Schließt den Dialog ohne Aktion
  }
}
