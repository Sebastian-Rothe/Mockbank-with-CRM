import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatButtonModule,
    MatDrawer,
    MatDrawerContainer,
    MatIconModule,
    MatToolbarModule,
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent {
    uid: string | null = null;
    user: User | null = null; // Benutzerdaten
  constructor(
    private authService: FirebaseAuthService,
    private router: Router,
    private firebaseService: FirebaseService
  ) {}
  ngOnInit(): void {
    this.uid = this.authService.getUid();
    console.log('Current UID:', this.uid);
    if (this.uid) {
      this.loadUser(this.uid);
    }
  }
  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.firebaseService.getUser(uid);
      console.log('Loaded user:', this.user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Erfolgreich ausgeloggt');
      this.router.navigate(['/']); // Optional: Navigiere zur Login-Seite
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  }
}
