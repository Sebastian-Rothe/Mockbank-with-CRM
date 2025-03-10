import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// services
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { DashboardDataServiceService } from '../../services/dashboard-data-service.service';
// models
import { User } from '../../models/user.class';
// material
import { MatDialog } from '@angular/material/dialog';
import { MatCard, } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
// components
import { TransfersComponent } from './transfers/transfers.component';
import { BankComponent } from '../bank/bank.component';
import { AccountsComponent } from './accounts/accounts.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    // MatCard,
    MatIconModule,
    // MatCardContent,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    // MatIcon,
    CommonModule,
    // MatMenu,
    TransfersComponent,
    
    BankComponent,
    AccountsComponent,
    UserDashboardComponent,
   
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null; 
  user$ = this.authService.user$; // Direkt das Observable speichern
  // uid$ = this.authService.uid$; // Falls nur die UID benötigt wird
  isGuest: boolean = false;

  constructor(
    private authService: FirebaseAuthService,
    public dialog: MatDialog,
    public dashboardData: DashboardDataServiceService
  ) {}

 
  ngOnInit(): void {
    // Falls du in TypeScript direkt auf den User zugreifen willst
    this.user$.subscribe(user => {
   
      this.user = user;
    });

  
    this.isGuest = this.authService.isGuestUser();
  }

  /**
   * Type guard to ensure accounts$ is defined.
   * @returns {boolean} True if accounts$ is defined, false otherwise.
   */
  hasAccounts(): boolean {
    return this.dashboardData.accounts$ !== undefined;
  }
  
  async loadUser(): Promise<void> {
    try {
      // this.user = await this.firebaseService.getUser(uid);
    }
    catch (error) {
      console.error('Error loading user:', error);
    }
 
  }

}
