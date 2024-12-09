import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule} from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { User } from '../../models/user.class';
import { provideNativeDateAdapter } from '@angular/material/core';
@Component({
  selector: 'app-dialog-edit-user-address',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,
    
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule],
  templateUrl: './dialog-edit-user-address.component.html',
  styleUrl: './dialog-edit-user-address.component.scss'
})
export class DialogEditUserAddressComponent {
  user = new User();
  birthDate: Date = new Date();
  constructor(private firebaseService: FirebaseService, public dialogRef: MatDialogRef<DialogEditUserAddressComponent>) {}
  saveNewUser() {
    // this.user.birthDate = this.birthDate.getTime();
    // this.firebaseService
    //   .addUser(this.user)
    //   .then((docRef) => {
    //     this.user.id = docRef.id;
    //     console.log('User added successfully with ID:', docRef.id);
    //     console.log(this.user.id);
        
    //   })
    //   .catch((error) => {
    //     console.error('Error adding user:', error);
    //   });
    // this.closeDialog();
  }
  

  closeDialog(): void {
    this.dialogRef.close(); 
  }
}

