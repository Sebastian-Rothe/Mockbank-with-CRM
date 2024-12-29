import { Component, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  uid: string | null = null;
  user: User | null = null; // Benutzerdaten

  constructor(private authService: FirebaseAuthService,  private firebaseService: FirebaseService) {}

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
}
