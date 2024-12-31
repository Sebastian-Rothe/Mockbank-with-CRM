import { Component, ChangeDetectionStrategy } from '@angular/core';
import { inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule} from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,
    MatOption,
    MatSelectModule,
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
  roles: string[] = ['user', 'admin', 'support', 'management'];

  constructor(private firebaseService: FirebaseService, public dialogRef: MatDialogRef<DialogAddUserComponent>) {}

  saveNewUser() {
    this.user.birthDate = this.birthDate.getTime();
    this.firebaseService
      .addUser(this.user)
      // .then((docRef) => {
      //   this.user.uid = docRef.uid;
      //   console.log('User added successfully with ID:', docRef.id);
      //   console.log(this.user.uid);
      // })
      .catch((error) => {
        console.error('Error adding user:', error);
      });
    this.closeDialog();
  }
  

  closeDialog(): void {
    this.dialogRef.close(); 
  }
  
}
