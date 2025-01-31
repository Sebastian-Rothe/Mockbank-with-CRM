import { Component } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { SharedService } from '../../services/shared.service';

import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';
import { updateDoc, doc } from 'firebase/firestore';
import { from } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { User } from '../../models/user.class';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-edit-user-detail',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './dialog-edit-user-detail.component.html',
  styleUrl: './dialog-edit-user-detail.component.scss',
})
export class DialogEditUserDetailComponent {
  uid: string = ''; // oder von einem Dienst setzen

  user = new User();
  birthDate: Date = new Date();
  profilePictureUrl: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private sharedService: SharedService,
    public dialogRef: MatDialogRef<DialogEditUserDetailComponent>
  ) {}

  ngOnInit() {
    if (this.user.birthDate) {
      this.user.birthDate = new Date(this.user.birthDate).getTime(); // Konvertiere Timestamp zu Date
    }
  }
  // saveNewUser(user: any): Observable<void> {
  //   const ref = doc(this.firebaseService.firestore, 'users', user.uid);
  //   this.closeDialog();
  //   return from(updateDoc(ref, { ...user }));
  // }
  saveNewUser(user: any): Observable<void> {
    const ref = doc(this.firebaseService.firestore, 'users', user.uid);
    const updatedUser = {
      ...user,
      birthDate:
        user.birthDate instanceof Date
          ? user.birthDate.getTime()
          : user.birthDate,
    };

    this.closeDialog();
    return from(updateDoc(ref, updatedUser));
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  getFormattedBirthDate(): string {
    return this.sharedService.formatTimestampToDate(this.user?.birthDate || 0);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      alert('Bitte laden Sie eine gültige Bilddatei hoch (jpg, png).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profilePictureUrl = reader.result as string;
      if (this.user) {
        this.user.profilePictureUrl = this.profilePictureUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  //  /**
  //  * Speichert das Profilbild des Benutzers.
  //  */
  //  async saveProfilePicture(): Promise<void> {
  //   const userId = this.uid;
  //   if (this.user?.profilePictureUrl) { // Greife auf `this.user.profilePictureUrl` zu
  //     try {
  //       await this.firebaseService.updateUserProfilePicture(userId, this.user.profilePictureUrl);
  //     } catch (error) {
  //       console.error('Fehler beim Speichern des Profilbilds:', error);
  //     }
  //   } else {
  //     alert('Bitte zuerst ein Bild auswählen.');
  //   }
  // }
}
