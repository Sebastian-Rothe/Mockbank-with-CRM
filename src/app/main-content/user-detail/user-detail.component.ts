//  
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
// Firebase
import { doc, onSnapshot } from 'firebase/firestore';
// Services
import { FirebaseService } from '../../../services/firebase.service';
import { SharedService } from '../../../services/shared.service';
// Models
import { User } from '../../../models/user.class';
// Angular Material
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
// Dialoge
import { DialogEditUserAddressComponent } from '../dialog-edit-user-address/dialog-edit-user-address.component';
import { DialogEditUserDetailComponent } from '../dialog-edit-user-detail/dialog-edit-user-detail.component';
import { DialogEditUserDetailsComponent } from '../dialog-edit-user-details/dialog-edit-user-details.component';
import { DialogEditUserAuthDataComponent } from '../dialog-edit-user-auth-data/dialog-edit-user-auth-data.component';


// import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    MatCard,
    // MatCardContent,
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
    private firebaseService: FirebaseService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => (this.userId = params['uid']));
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
        this.user = new User({ ...userData, uid: docSnap.id }); // id hinzufügen
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
  getFormattedBirthDate(): string {
    return this.sharedService.formatTimestampToDate(this.user?.birthDate || 0);
  }

  editUserContact() {
    console.log('Edit User Contact');
  }
  editUserDetails() {
     if (this.user){
      const dialog = this.dialog.open(DialogEditUserDetailsComponent);
      dialog.componentInstance.user = new User(this.user.toPlainObject());
    }
  }
  editUserAuth() {
    if (this.user){
      const dialog = this.dialog.open(DialogEditUserAuthDataComponent);
      dialog.componentInstance.user = new User(this.user.toPlainObject());
    }
  }
  
}
