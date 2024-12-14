import { Component, inject } from '@angular/core';
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
@Component({
  selector: 'app-open-new-account',
  standalone: true,
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
  private _formBuilder = inject(FormBuilder);

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
      [Validators.required, Validators.pattern(/^\d{5}$/)], // 5-digit zip code
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