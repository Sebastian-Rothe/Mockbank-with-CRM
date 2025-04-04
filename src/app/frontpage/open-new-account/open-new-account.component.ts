import { Component, inject, HostListener } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import jsPDF from 'jspdf'; 
//  material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
// models
import { User } from '../../models/user.class';
// services 
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { DialogService } from '../../services/dialog.service';
import { UserService } from '../../services/user.service';

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
    CommonModule
  ],
  templateUrl: './open-new-account.component.html',
  styleUrl: './open-new-account.component.scss',
})
export class OpenNewAccountComponent {
  user = new User();
  birthDate: Date = new Date();
  isScreenSmall = false;
  private _formBuilder = inject(FormBuilder);
  constructor(
    private router: Router,
    private firebaseAuthService: FirebaseAuthService,
    private dialogService: DialogService,
    private userService: UserService,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isScreenSmall = event.target.innerWidth <= 680;
  }

  ngOnInit() {
    this.isScreenSmall = window.innerWidth <= 680;
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
    birthDate: ['', Validators.required], // Should be a valid date
    streetAddress: ['', Validators.required],
    zipCode: [
      '',
      [Validators.required, Validators.pattern(/^\d{5}$/)], // 5-digit zip code
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
          Validators.pattern(
            /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/
          ),
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
          this.user.uid = firebaseUser.uid; 
          this.user.email = firebaseUser.email || '';
          this.user.countryCode =
            this.firstFormGroup.get('countryCode')?.value || '';
          this.user.phoneNumber =
            this.firstFormGroup.get('phoneNumber')?.value || '';
          this.user.firstName =
            this.secondFormGroup.get('firstName')?.value || '';
          this.user.lastName =
            this.secondFormGroup.get('lastName')?.value || '';
          const birthDateValue = this.secondFormGroup.get('birthDate')?.value;
          this.user.birthDate = birthDateValue
            ? new Date(birthDateValue).getTime()
            : 0;

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
          this.userService
            .addUserWithAccount(this.user)
            .then(() => {
              // Dialog öffnen
              this.dialogService.openDialog(
                'Registration Successful',
                'The user has been created successfully!',
                'info'
              ).then((result) => {
                if (result) {
                  this.router.navigate(['/']);
                }
              });
            })
            .catch((error) => {
              this.dialogService.openDialog('Error', 'Error saving the user in Firestore: ' + error, 'error');
            });
        }
      })
      .catch((error) => {
        this.dialogService.openDialog('Error', 'Error registering the user: ' + error, 'error');
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
    doc.text(
      `Country Code: ${this.firstFormGroup.get('countryCode')?.value || 'N/A'}`,
      10,
      30
    );
    doc.text(
      `Phone Number: ${this.firstFormGroup.get('phoneNumber')?.value || 'N/A'}`,
      10,
      40
    );
    doc.text(
      `Email: ${this.firstFormGroup.get('email')?.value || 'N/A'}`,
      10,
      50
    );

    // Adressdetails
    doc.text('Address Details:', 10, 60);
    doc.text(
      `First Name: ${this.secondFormGroup.get('firstName')?.value || 'N/A'}`,
      10,
      70
    );
    doc.text(
      `Last Name: ${this.secondFormGroup.get('lastName')?.value || 'N/A'}`,
      10,
      80
    );
    doc.text(
      `City: ${this.secondFormGroup.get('city')?.value || 'N/A'}`,
      10,
      90
    );

    // Zusätzliche Informationen
    doc.text('Additional Information:', 10, 100);
    doc.text(
      `Occupation: ${this.thirdFormGroup.get('occupation')?.value || 'N/A'}`,
      10,
      110
    );
    doc.text(
      `Nationality: ${this.thirdFormGroup.get('nationality')?.value || 'N/A'}`,
      10,
      120
    );

    // Footer mit Datum
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 10, 280);

    // PDF speichern
    doc.save('Application_Summary.pdf');
  }

  isLinear = false;

  passwordVisible = false;

  exit(): void {
    this.router.navigate(['/']); // Navigiert zur Startseite oder einer anderen definierten Route
  }
}
