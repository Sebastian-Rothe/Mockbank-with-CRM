import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
export class MainContentComponent implements OnInit, AfterViewInit {
  isDrawerOpened: boolean = true; // Lokale Variable für den Drawer-Status
  drawerMode: MatDrawerMode = 'side'; // Standardmodus für große Screens
  uid: string | null = null;
  user: User | null = null;

  constructor(
    private authService: FirebaseAuthService,
    private router: Router,
    private firebaseService: FirebaseService,
    private breakpointObserver: BreakpointObserver,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Bildschirmgröße überwachen
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      if (result.matches) {
        this.drawerMode = 'over';
        this.isDrawerOpened = false; // Drawer schließen auf kleinen Bildschirmen
      } else {
        this.drawerMode = 'side';
        this.isDrawerOpened = true; // Drawer öffnen auf großen Bildschirmen
      }
      this.cdRef.detectChanges();
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

  ngAfterViewInit(): void {
      this.cdRef.detectChanges();
  }

  // Ereignisbehandler, wenn der Drawer geöffnet wird
  onDrawerOpened(): void {
    this.isDrawerOpened = true;
  }

  // Ereignisbehandler, wenn der Drawer geschlossen wird
  onDrawerClosed(): void {
    this.isDrawerOpened = false;
  }

  // Berechnung und Verteilung der Zinsen
  async calculateAndDistributeInterest(): Promise<void> {
    try {
      this.firebaseService.calculateAndDistributeInterest(this.user!);
    } catch (error) {
      console.error('Error with interest:', error);
    }
  }

  // Logout-Logik
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Erfolgreich ausgeloggt');
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  }

  share() {
    if (navigator.share) {
      navigator.share({
        title: 'My Awesome Content',
        text: 'Check out this amazing content!',
        url: window.location.href,
      })
      .then(() => console.log('Content shared successfully'))
      .catch((error) => console.error('Error sharing content:', error));
    } else {
      this.shareOnSocialMedia();
    }
  }

  private shareOnSocialMedia() {
    const url = window.location.href;
    const text = 'Check out this amazing content!';
    const title = 'My Awesome Content';

    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=yourtwitterhandle`, '_blank');
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`, '_blank');
  }
}
