import { Component } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';
import { updateDoc, doc } from 'firebase/firestore';
import { from } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule} from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { User } from '../../models/user.class';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-dialog-edit-user-address',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule],
  templateUrl: './dialog-edit-user-address.component.html',
  styleUrl: './dialog-edit-user-address.component.scss'
})
export class DialogEditUserAddressComponent {
  user = new User();

  constructor(private firebaseService: FirebaseService, public dialogRef: MatDialogRef<DialogEditUserAddressComponent>) {}
  
  saveNewUser(user: any): Observable<void> {
    const ref = doc(this.firebaseService.firestore, 'users', user.uid);
    this.closeDialog();
    return from(updateDoc(ref, { ...user }));
 }
  

  closeDialog(): void {
    this.dialogRef.close(); 
  }
}

