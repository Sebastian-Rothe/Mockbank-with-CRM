import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { User } from '../../../models/user.class';
import { MatCardModule } from '@angular/material/card';

import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  users$: Observable<User[]>; // Originale Users aus Firebase
  filteredUsers: User[] = []; // Gefilterte Users für die Anzeige
  allUsers: User[] = []; // Lokale Kopie aller User
  userCount: number = 0;
  constructor(
    public dialog: MatDialog,
    private firebaseService: FirebaseService
  ) {
    this.users$ = this.firebaseService.getUsers();
    this.users$.subscribe(users => {
      this.allUsers = users;
      this.filteredUsers = users;
      this.userCount = users.length;
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement; // Type assertion to HTMLInputElement
    const query = input.value;
  
    if (query) {
      const lowerQuery = query.toLowerCase();
      this.filteredUsers = this.allUsers.filter(user =>
        user.firstName.toLowerCase().includes(lowerQuery) ||
        user.lastName.toLowerCase().includes(lowerQuery) ||
        user.email?.toLowerCase().includes(lowerQuery) ||
        user.streetAddress?.toLowerCase().includes(lowerQuery) ||
        user.city?.toLowerCase().includes(lowerQuery)
      );
    } else {
      this.filteredUsers = [...this.allUsers];
    }
  }
  
  
}
