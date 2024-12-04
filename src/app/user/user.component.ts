import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { User } from '../../models/user.class';
import { MatCardModule } from '@angular/material/card';
import {
  collectionData,
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  orderBy,
  where,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [MatIcon, MatCardModule, CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  user: User = new User();
  user$: Observable<User[]>;
  firestore: Firestore = inject(Firestore);

  constructor(public dialog: MatDialog) {
    const userCollection = collection(this.firestore, 'users');
    this.user$ = collectionData(userCollection, { idField: 'id' }) as Observable<User[]>;

  }

  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }
}
