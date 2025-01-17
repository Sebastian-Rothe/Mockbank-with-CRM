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
    this.authService.uid$.subscribe((uid) => {
      console.log('Aktuelle UID:', uid);
      if (uid) {
        this.uid = uid; 
        this.loadUser(uid); 
      }
    });
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

  share() {
    if (navigator.share) {
      // Web Share API - funktioniert auf mobilen Geräten und einigen Desktop-Browsern
      navigator.share({
        title: 'My Awesome Content',
        text: 'Check out this amazing content!',
        url: window.location.href, // URL der aktuellen Seite
      })
      .then(() => console.log('Content shared successfully'))
      .catch((error) => console.error('Error sharing content:', error));
    } else {
      // Fallback - Social Media Links für Sharing (z.B. Facebook, Twitter)
      this.shareOnSocialMedia();
    }
  }

  private shareOnSocialMedia() {
    const url = window.location.href;
    const text = 'Check out this amazing content!';
    const title = 'My Awesome Content';

    // Beispiel für das Teilen auf Facebook
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    
    // Beispiel für das Teilen auf Twitter
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=yourtwitterhandle`, '_blank');
  
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`, '_blank');
  }
}
