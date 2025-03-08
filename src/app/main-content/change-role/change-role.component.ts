import { Component } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
// services
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { UserService } from '../../../services/user.service';
import { SnackbarService } from '../../../services/snackbar.service';
// models
import { User } from '../../../models/user.class';
// material
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
    private authService: FirebaseAuthService,
    private userService: UserService,
    private firestore: Firestore,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.uid = this.authService.getUid();
  
    if (this.uid) {
      this.loadUser(this.uid);
    }
  }

  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.userService.getUser(uid);
 
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  async updateUserRole() {
    if (this.user?.uid) {
      try {
        const userDocRef = doc(this.firestore, 'users', this.user.uid);
        await updateDoc(userDocRef, { role: this.user.role });
        this.snackbarService.success(`User role updated to: ${this.user.role}`);
      } catch (error) {
        this.snackbarService.error('Error updating role');
      }
    }
  }
}
