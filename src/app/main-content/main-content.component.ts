import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { MatDrawerMode } from '@angular/material/sidenav';
// Models
import { User } from '../../models/user.class';
// Services
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { BankService } from '../../services/bank.service';

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
  isDrawerOpened: boolean = true; 
  drawerMode: MatDrawerMode = 'side'; 
  uid: string | null = null;
  user: User | null = null;
  isGuest: boolean = false;

  constructor(
    private authService: FirebaseAuthService,
    private breakpointObserver: BreakpointObserver,
    private cdRef: ChangeDetectorRef,
    private bankService: BankService
  ) {}

  ngOnInit(): void {
    this.adjustSidenav(window.innerWidth);
    window.addEventListener('resize', this.onResize.bind(this));
    
    combineLatest([this.authService.uid$, this.authService.user$]).subscribe(
      ([uid, user]) => {
        if (uid && user) {
          this.uid = uid;
          this.user = user;
          this.calculateAndDistributeInterest();
          this.isGuest = this.authService.isGuestUser();
        }
      }
    );
  }

  ngAfterViewInit(): void {
      this.cdRef.detectChanges();
  }

  onResize(event: Event): void {
    const target = event.target as Window;
    this.adjustSidenav(target.innerWidth);
  }

  adjustSidenav(width: number): void {
    if (width >= 800) {
      this.drawerMode = 'side';
      this.isDrawerOpened = true;
    } else {
      this.drawerMode = 'over';
      this.isDrawerOpened = false;
    }
    this.cdRef.detectChanges();
  }



  // Berechnung und Verteilung der Zinsen
  async calculateAndDistributeInterest(): Promise<void> {
    try {
      this.bankService.calculateAndDistributeInterest(this.user!);
    } catch (error) {
      console.error('Error with interest:', error);
    }
  }

  // Logout-Logik
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error on logout:', error);
    }
  }

  share() {
    if (navigator.share) {
      navigator.share({
        title: 'My Awesome Content',
        text: 'Check out this amazing content!',
        url: window.location.href,
      })
      // .then(() => console.log('Content shared successfully'))
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
