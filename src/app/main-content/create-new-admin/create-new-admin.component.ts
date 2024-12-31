import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-create-new-admin',
  standalone: true,
  imports: [  MatDialogModule,
      // MatDialogClose,
      MatFormFieldModule,
      FormsModule,
      MatOption,
      MatSelectModule,
      MatInputModule,
      MatDatepickerModule,
      MatButtonModule,
      ReactiveFormsModule],
  templateUrl: './create-new-admin.component.html',
  styleUrl: './create-new-admin.component.scss'
})
export class CreateNewAdminComponent {
  // formGroup: FormGroup;
  roles: string[] = ['user', 'admin', 'support', 'management'];
  private _formBuilder = inject(FormBuilder);
  constructor() {}

    formGroup = this._formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        role: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  

  passwordMatchValidator(group: FormGroup): { passwordMismatch: boolean } | null {
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
    if (this.formGroup.valid) {
      console.log(this.formGroup.value);
      // Add your form submission logic here
    }
  }
}
