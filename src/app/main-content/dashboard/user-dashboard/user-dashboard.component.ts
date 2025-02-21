import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SharedService } from '../../../../services/shared.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { DashboardDataServiceService } from '../../../../services/dashboard-data-service.service';
import { User } from '../../../../models/user.class';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIcon],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  user: User | null = null;
  totalBalance: number = 0;
  isImageSelected = false;
  profilePictureUrl: string = '';

  constructor(
    private dashboardData: DashboardDataServiceService,
    private sharedService: SharedService,
    private authService: FirebaseAuthService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    // Abonniere das Benutzer-Observable, das im DashboardDataService verwaltet wird
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });

    // Berechne die Gesamtsumme anhand der geladenen Accounts
    this.dashboardData.accounts$.subscribe((accounts) => {
      this.totalBalance = accounts.reduce(
        (sum, account) => sum + account.balance,
        0
      );
    });
}
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.isImageSelected = true;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];
  const allowedTypes = ['image/jpeg', 'image/png'];

  // Check if the file type is allowed
  if (!allowedTypes.includes(file.type)) {
    alert('Bitte laden Sie eine gültige Bilddatei hoch (jpg, png).');
    return;
  }

  // Check if the file size is less than 1MB (1MB = 1024 * 1024 bytes)
  const maxSize = 1 * 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    alert('Das Bild darf maximal 1MB groß sein.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    this.profilePictureUrl = reader.result as string;
    if (this.user) {
      this.user.profilePictureUrl = this.profilePictureUrl;
      await this.saveProfilePicture();
    }
  };
  reader.readAsDataURL(file);
}


// This function is now automatically called after the image is selected
async saveProfilePicture(): Promise<void> {
  if (this.user?.uid && this.user?.profilePictureUrl) {
    try {
      await this.firebaseService.updateUserProfilePicture(
        this.user.uid,
        this.user.profilePictureUrl
      );
      this.isImageSelected = false;
    } catch (error) {
      console.error('Fehler beim Speichern des Profilbilds:', error);
    }
  } else {
    alert('Bitte zuerst ein Bild auswählen.');
  }
}


getFormattedCurrency(value: number): string {
  return this.sharedService.getFormattedCurrency(value);
}
}
