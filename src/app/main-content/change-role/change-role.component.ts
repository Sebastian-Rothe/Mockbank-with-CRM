import { Component } from '@angular/core';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { User } from '../../../models/user.class';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
@Component({
  selector: 'app-change-role',
  standalone: true,
  imports: [ MatFormFieldModule, MatSelect, MatOption],
  templateUrl: './change-role.component.html',
  styleUrl: './change-role.component.scss',
})
export class ChangeRoleComponent {
  uid: string | null = null; // User-ID
  user: User | null = null;

  roles: Array<'user' | 'admin' | 'guest' | 'management'> = [
    'user',
    'admin',
    'guest',
    'management',
  ];
  constructor(
    private firebaseService: FirebaseService,
    private authService: FirebaseAuthService,
    private firestore: Firestore
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
  async updateUserRole() {
    if (this.user?.uid) {
      try {
        const userDocRef = doc(this.firestore, 'users', this.user.uid);
        await updateDoc(userDocRef, { role: this.user.role });
        console.log(`User role updated to: ${this.user.role}`);
      } catch (error) {
        console.error('Error updating role:', error);
      }
    }
  }
}
