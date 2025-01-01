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

import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { User } from '../../../models/user.class';
import { FirebaseService } from '../../../services/firebase.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import jsPDF from 'jspdf'; // PDF-Bibliothek installieren: `npm install jspdf`
import { Router } from '@angular/router';
import { SuccessDialogComponent } from '../success-dialog/success-dialog.component';

@Component({
  selector: 'app-open-new-account',
  standalone: true,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
    provideNativeDateAdapter(),
  ],
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
    MatDatepickerModule,
   
  ],
  templateUrl: './open-new-account.component.html',
  styleUrl: './open-new-account.component.scss',
})
export class OpenNewAccountComponent {
  user = new User();
  birthDate: Date = new Date();
  private _formBuilder = inject(FormBuilder);
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private firebaseService: FirebaseService,
    private firebaseAuthService: FirebaseAuthService
  ) {}

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
    birthDate: ['', Validators.required], // Should be a valid date
    streetAddress: ['', Validators.required],
    zipCode: [
      '',
      [Validators.required, Validators.pattern(/^\d{6}$/)], // 5-digit zip code
    ],
    city: ['', Validators.required],
  });

  thirdFormGroup = this._formBuilder.group({
    occupation: ['', Validators.required],
    nationality: ['', Validators.required],
    taxId: ['', Validators.pattern(/^\d{9,15}$/)], // Optional, numeric tax ID
  });

  fourthFormGroup = this._formBuilder.group(
    {
      password: [
        '',
        [
          Validators.required,
          // Validators.pattern(
          //   /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          // ),
          Validators.minLength(6) // for testing
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(formGroup: any) {
    const password = formGroup.get('password').value;
    const confirmPassword = formGroup.get('confirmPassword').value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get passwordMismatch() {
    return (
      this.fourthFormGroup.hasError('mismatch') &&
      this.fourthFormGroup.get('confirmPassword')?.touched
    );
  }
  saveNewUser() {
    const email = this.firstFormGroup.get('email')?.value || '';
    const password = this.fourthFormGroup.get('password')?.value || '';
  
    this.firebaseAuthService
      .register(email, password)
      .then((firebaseUser) => {
        if (firebaseUser) {
          // Zusätzliche Daten für Firestore-User setzen
          this.user.uid = firebaseUser.uid; // UID aus Firebase Auth als ID für Firestore-Dokument
          this.user.email = firebaseUser.email || '';
          this.user.countryCode =
            this.firstFormGroup.get('countryCode')?.value || '';
          this.user.phoneNumber =
            this.firstFormGroup.get('phoneNumber')?.value || '';
          this.user.firstName =
            this.secondFormGroup.get('firstName')?.value || '';
          this.user.lastName = this.secondFormGroup.get('lastName')?.value || '';
          this.user.birthDate = this.birthDate.getTime();
          this.user.streetAddress =
            this.secondFormGroup.get('streetAddress')?.value || '';
          this.user.zipCode = this.secondFormGroup.get('zipCode')?.value || '';
          this.user.city = this.secondFormGroup.get('city')?.value || '';
          this.user.occupation =
            this.thirdFormGroup.get('occupation')?.value || '';
          this.user.nationality =
            this.thirdFormGroup.get('nationality')?.value || '';
          this.user.taxId = this.thirdFormGroup.get('taxId')?.value || '';
  
          // Benutzer in Firestore speichern
          this.firebaseService
            .addUser(this.user)
            .then(() => {
              console.log('Benutzer erfolgreich gespeichert:', this.user.uid);
              // this.router.navigate(['/']);
                    // Dialog öffnen
                    const dialogRef = this.dialog.open(SuccessDialogComponent);

                    // Dialog-Aktion abfangen
                    dialogRef.afterClosed().subscribe((result) => {
                      if (result === 'goToHome') {
                        this.router.navigate(['/']);
                      }
                    });
            })
            .catch((error) => {
              console.error(
                'Fehler beim Speichern des Benutzers in Firestore:',
                error
              );
            });
        }
      })
      .catch((error) => {
        console.error('Fehler beim Registrieren des Benutzers:', error);
      });
  }
  
  downloadPdf() {
    const doc = new jsPDF();
    // Titel
    doc.setFontSize(16);
    doc.text('Application Summary', 10, 10);
  
    // Kontaktinformationen
    doc.setFontSize(12);
    doc.text('Contact Information:', 10, 20);
    doc.text(`Country Code: ${this.firstFormGroup.get('countryCode')?.value || 'N/A'}`, 10, 30);
    doc.text(`Phone Number: ${this.firstFormGroup.get('phoneNumber')?.value || 'N/A'}`, 10, 40);
    doc.text(`Email: ${this.firstFormGroup.get('email')?.value || 'N/A'}`, 10, 50);
  
    // Adressdetails
    doc.text('Address Details:', 10, 60);
    doc.text(`First Name: ${this.secondFormGroup.get('firstName')?.value || 'N/A'}`, 10, 70);
    doc.text(`Last Name: ${this.secondFormGroup.get('lastName')?.value || 'N/A'}`, 10, 80);
    doc.text(`City: ${this.secondFormGroup.get('city')?.value || 'N/A'}`, 10, 90);
  
    // Zusätzliche Informationen
    doc.text('Additional Information:', 10, 100);
    doc.text(`Occupation: ${this.thirdFormGroup.get('occupation')?.value || 'N/A'}`, 10, 110);
    doc.text(`Nationality: ${this.thirdFormGroup.get('nationality')?.value || 'N/A'}`, 10, 120);
  
    // Footer mit Datum
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 10, 280);
  
    // PDF speichern
    doc.save('Application_Summary.pdf');
  }
  
  isLinear = false;

  passwordVisible = false;
}
