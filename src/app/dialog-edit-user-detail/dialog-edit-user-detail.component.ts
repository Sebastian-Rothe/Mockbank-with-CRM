import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

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
@Component({
  selector: 'app-dialog-edit-user-detail',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [ MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,
    
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule],
  templateUrl: './dialog-edit-user-detail.component.html',
  styleUrl: './dialog-edit-user-detail.component.scss'
})
export class DialogEditUserDetailComponent {
  user = new User();
  birthDate: Date = new Date();

  constructor(private firebaseService: FirebaseService, public dialogRef: MatDialogRef<DialogEditUserDetailComponent>) {}
  
  saveNewUser(user: any): Observable<void> {
    const ref = doc(this.firebaseService.firestore, 'users', user.id);
    this.closeDialog();
    return from(updateDoc(ref, { ...user }));
 }
  
  closeDialog(): void {
    this.dialogRef.close(); 
  }
}

