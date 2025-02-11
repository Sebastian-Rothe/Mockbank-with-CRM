import { Component, OnInit } from '@angular/core';
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
import { combineLatest } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawerMode } from '@angular/material/sidenav';
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
export class MainContentComponent implements OnInit{
    uid: string | null = null;
    user: User | null = null; // Benutzerdaten

    drawerMode: MatDrawerMode = 'side'; // Standardmodus für große Screens
    isDrawerOpened = true; // Standardmäßig offen für Desktop
  constructor(
    private authService: FirebaseAuthService,
    private router: Router,
    private firebaseService: FirebaseService,
    private breakpointObserver: BreakpointObserver
  ) {}
  ngOnInit(): void {
    // Bildschirmgröße überwachen
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      if (result.matches) {
        // Kleine Bildschirme (z. B. Smartphones)
        this.drawerMode = 'over';
        this.isDrawerOpened = false;
      } else {
        // Große Bildschirme (z. B. Desktop)
        this.drawerMode = 'side';
        this.isDrawerOpened = true;
      }
    });

    // Benutzerinformationen laden
    combineLatest([this.authService.uid$, this.authService.user$]).subscribe(
      ([uid, user]) => {
        if (uid && user) {
          this.uid = uid;
          this.user = user;
          this.calculateAndDistributeInterest();
        }
      }
    );
  }

  async calculateAndDistributeInterest(): Promise<void> {
    try {
      this.firebaseService.calculateAndDistributeInterest(this.user!)
    } catch (error) {
      console.error('Error with interest:', error);
    }
  }
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Erfolgreich ausgeloggt');
      // this.router.navigate(['/']); // Optional: Navigiere zur Login-Seite
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
