import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { User } from '../../../models/user.class';
import { MatIcon } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
@Component({
  selector: 'app-create-new-admin',
  standalone: true,
  imports: [
    MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,
    FormsModule,
    MatOption,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './create-new-admin.component.html',
  styleUrl: './create-new-admin.component.scss',
})
export class CreateNewAdminComponent {
  // formGroup: FormGroup;
  passwordVisible = false;
  user = new User();
  roles: string[] = ['user', 'admin', 'management'];
  private _formBuilder = inject(FormBuilder);
  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private userService: UserService,
  ) {}

  formGroup = this._formBuilder.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          // Validators.pattern(
          //   /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          // ), => not in use
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(
    group: FormGroup
  ): { passwordMismatch: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get passwordMismatch() {
    return (
      this.formGroup.hasError('mismatch') &&
      this.formGroup.get('confirmPassword')?.touched
    );
  }

  saveNewAdmin(): void {
    const email = this.formGroup.get('email')?.value || '';
    const password = this.formGroup.get('password')?.value || '';

    this.firebaseAuthService
      .registerWithoutLogin(email, password) // Use new method to register without login
      .then((firebaseUser) => {
        if (firebaseUser) {
          // Zusätzliche Daten für Firestore-User setzen
          this.user.uid = firebaseUser.uid; // UID aus Firebase Auth als ID für Firestore-Dokument
          this.user.email = firebaseUser.email || '';
          this.user.firstName = this.formGroup.get('firstName')?.value || '';
          this.user.lastName = this.formGroup.get('lastName')?.value || '';
          this.user.role = this.formGroup.get('role')?.value || '';
          // Benutzer in Firestore speichern
          this.userService
            .addUserWithAccount(this.user)
            .then(() => {
              console.log('Benutzer erfolgreich gespeichert:', this.user.uid);
              // this.router.navigate(['/']);
                    // Dialog öffnen
                    // const dialogRef = this.dialog.open(SuccessDialogComponent);

                    // // Dialog-Aktion abfangen
                    // dialogRef.afterClosed().subscribe((result) => {
                    //   if (result === 'goToHome') {
                    //     this.router.navigate(['/']);
                    //   }
                    // });
              
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
}
