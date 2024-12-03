import { Component, ChangeDetectionStrategy } from '@angular/core';
import { inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { User } from '../../models/user.class';

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
  where
} from '@angular/fire/firestore';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAddUserComponent {
  user = new User();
  birthDate: Date = new Date();
  
  firestore: Firestore = inject(Firestore);
  constructor() {}

  saveNewUser() {
    this.user.birthDate = this.birthDate.getTime(); 
    const usersCollection = collection(this.firestore, 'users');
    
    const userData = this.user.toPlainObject();
  
    addDoc(usersCollection, userData)
      .then((result) => {
        console.log('User added successfully:', result);
      })
      .catch((error) => {
        console.error('Error adding user:', error);
      });
  }
  
}
