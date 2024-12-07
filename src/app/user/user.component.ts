import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { User } from '../../models/user.class';
import { MatCardModule } from '@angular/material/card';

import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [MatIcon, MatCardModule, CommonModule, RouterLink],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  user: User = new User();
  user$: Observable<User[]>;
 
  constructor(public dialog: MatDialog, private firebaseService: FirebaseService) {
    this.user$ = this.firebaseService.getUsers();
  }

  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }
 
}
