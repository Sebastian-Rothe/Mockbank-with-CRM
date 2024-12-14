import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';


import { MatDialogModule} from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { User } from '../../models/user.class';
import { FirebaseService } from '../../services/firebase.service';
@Component({
  selector: 'app-open-new-account',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './open-new-account.component.html',
  styleUrl: './open-new-account.component.scss',
})
export class OpenNewAccountComponent {
  user = new User();
  birthDate: Date = new Date();
  private _formBuilder = inject(FormBuilder);

  constructor(private firebaseService: FirebaseService) {}

    saveNewUser() {
    // Zugriff auf die FormGroup-Werte direkt
    this.user.countryCode = this.firstFormGroup.get('countryCode')?.value || '';  
    this.user.phoneNumber = this.firstFormGroup.get('phoneNumber')?.value || '';  
    this.user.email = this.firstFormGroup.get('email')?.value || '';  
    this.user.firstName = this.secondFormGroup.get('firstName')?.value || '';
    this.user.lastName = this.secondFormGroup.get('lastName')?.value || '';  
    this.user.birthDate = this.birthDate.getTime();  
    this.user.streetAddress = this.secondFormGroup.get('streetAddress')?.value || '';  
    this.user.zipCode = this.secondFormGroup.get('zipCode')?.value || '';  
    this.user.city = this.secondFormGroup.get('city')?.value || '';  
    this.user.occupation = this.thirdFormGroup.get('occupation')?.value || '';  
    this.user.nationality = this.thirdFormGroup.get('nationality')?.value || '';  
    this.user.taxId = this.thirdFormGroup.get('taxId')?.value || '';  


    // Speichern des Benutzers in Firebase
    this.firebaseService
    .addUser(this.user)
    .then((docRef) => {
        this.user.id = docRef.id;
        console.log('User added successfully with ID:', docRef.id);
        console.log(this.user.id);
      })
      .catch((error) => {
        console.error('Error adding user:', error);
      });
  }

  firstFormGroup = this._formBuilder.group({
    countryCode: [
      '',
      [Validators.required, Validators.pattern(/^\+\d{1,3}$/)], // E.g., +49
    ],
    phoneNumber: [
      '',
      [Validators.required, Validators.pattern(/^\d{10,15}$/)], // E.g., 10-15 digits
    ],
    email: ['', [Validators.required, Validators.email]],
  });

  secondFormGroup = this._formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required], // Should be a valid date
    streetAddress: ['', Validators.required],
    zipCode: [
      '',
      [Validators.required, Validators.pattern(/^\d{6}$/)], // 5-digit zip code
    ],
    city: ['', Validators.required],
  });

  thirdFormGroup = this._formBuilder.group({
    occupation: [''], // Optional field
    nationality: [''], // Optional field
    taxId: ['', Validators.pattern(/^\d{9,15}$/)], // Optional, numeric tax ID
  });

  isLinear = false;
}