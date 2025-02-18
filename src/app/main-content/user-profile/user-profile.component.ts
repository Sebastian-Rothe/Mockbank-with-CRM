import { Component } from '@angular/core';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';

import { SharedService } from '../../../services/shared.service';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {

  uid: string | null = null;
  user: User | null = null; // Benutzerdaten

  constructor(
    private authService: FirebaseAuthService,
    private firebaseService: FirebaseService,
    private sharedService: SharedService)
  { }
  ngOnInit(): void {
    this.authService.uid$.subscribe((uid) => {
    
      if (uid) {
        this.uid = uid; 
        // this.loadUser(uid); 
      }
    });
  }
  // async loadUser(uid: string): Promise<void> {
  //   try {
  //     // this.user = await this.firebaseService.getUser(uid);
  //     console.log('Loaded user:', this.user);
  //   } catch (error) {
  //     console.error('Error loading user:', error);
  //   }
  // }
  getFormattedBirthDate(): string {
    return this.sharedService.formatTimestampToDate(this.user?.birthDate || 0);
  }
  editProfile(){}
  editAddress(){}
}
