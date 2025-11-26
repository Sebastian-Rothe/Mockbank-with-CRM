import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

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
export class ContactComponent {
  http = inject(HttpClient);

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
