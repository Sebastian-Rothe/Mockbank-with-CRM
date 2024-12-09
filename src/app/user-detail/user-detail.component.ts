import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { User } from '../../models/user.class';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditUserAddressComponent } from '../dialog-edit-user-address/dialog-edit-user-address.component';
import { DialogEditUserDetailComponent } from '../dialog-edit-user-detail/dialog-edit-user-detail.component';

import { doc, onSnapshot } from 'firebase/firestore';
// import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatIconButton,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  userId = '';
  user: User | null = null;
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => (this.userId = params['id']));
    console.log(this.userId);
    this.getUserDetails(this.userId);
  }
  getUserDetails(userId: string): void {
    const userRef = doc(this.firebaseService.firestore, 'users', userId);

    // Realtime listener auf das Firestore-Dokument
    onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        // Füge die id hinzu, damit sie im User-Objekt enthalten ist
        const userData = docSnap.data();
        this.user = new User({ ...userData, id: docSnap.id }); // id hinzufügen
        console.log('User fetched:', this.user);
      } else {
        console.log('User not found');
      }
    });
  }
  editUserDetail() {
    if (this.user) {
      const dialog = this.dialog.open(DialogEditUserDetailComponent);
      dialog.componentInstance.user = new User(this.user.toPlainObject());
    }
  }

  editUserAddress() {
    if (this.user){
      const dialog = this.dialog.open(DialogEditUserAddressComponent);
      dialog.componentInstance.user = new User(this.user.toPlainObject());
    }
  }
}
