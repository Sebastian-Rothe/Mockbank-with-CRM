import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  http = inject(HttpClient);
  authService = inject(FirebaseAuthService);

  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  showPopup = false;
  mailTest = false; // Set to true for testing without sending

  post = {
    endPoint: 'https://sebastian-rothe.com/sendMail.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'text' as 'json'
    },
  };

  ngOnInit() {
    // Auto-fill name and email if user is logged in
    this.authService.user$.subscribe(user => {
      if (user) {
        this.contactData.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        this.contactData.email = user.email || '';
      }
    });
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest) {
      this.isSubmitting = true;
      this.http
        .post(this.post.endPoint, this.post.body(this.contactData))
        .subscribe({
          next: (response) => {
            this.openPopup();
            ngForm.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error sending email:', error);
            alert('Failed to send message. Please try again or contact us directly.');
            this.isSubmitting = false;
          },
        });
    } else if (ngForm.submitted && ngForm.form.valid && this.mailTest) {
      console.log('Test mode - Contact Data:', this.contactData);
      this.openPopup();
      ngForm.resetForm();
    } else {
      this.setFormControlsTouched(ngForm);
    }
  }

  private setFormControlsTouched(ngForm: NgForm) {
    Object.keys(ngForm.controls).forEach(controlName => {
      ngForm.controls[controlName].markAsTouched();
    });
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}
