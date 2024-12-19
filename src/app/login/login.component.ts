import { Component, ChangeDetectionStrategy } from '@angular/core';
import { inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { User } from '../../models/user.class';
import { FirebaseService } from '../../services/firebase.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDialogModule,
    // MatDialogClose,
    MatFormFieldModule,

    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {}
