import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// services
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedService } from '../../../services/shared.service';
import { DashboardDataServiceService } from '../../../services/dashboard-data-service.service';
// models
import { User } from '../../../models/user.class';
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
// charts
import { FirstChartsComponent } from '../../../charts/first-charts/first-charts.component';
import { MonthlyExpensesChartComponent } from '../../../charts/monthly-expenses-chart/monthly-expenses-chart.component';
import { UserGrowthChartComponent } from '../../../charts/user-growth-chart/user-growth-chart.component';
import { TransfersChartComponent } from '../../../charts/transfers-chart/transfers-chart.component';

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
    FirstChartsComponent, // first charts component
    MonthlyExpensesChartComponent,
    BankComponent,
    AccountsComponent,
    UserDashboardComponent,
    UserGrowthChartComponent,
    TransfersChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null; 
  user$ = this.authService.user$; // Direkt das Observable speichern
  uid$ = this.authService.uid$; // Falls nur die UID benötigt wird
  isGuest: boolean = false;

  constructor(
    private authService: FirebaseAuthService,
    private firebaseService: FirebaseService,
    private dashboardData: DashboardDataServiceService,
    public dialog: MatDialog
  ) {}

 
  ngOnInit(): void {
    // Falls du in TypeScript direkt auf den User zugreifen willst
    this.user$.subscribe(user => {
      console.log('Aktueller User:', user);
      this.user = user;
    });

    this.uid$.subscribe(uid => {
      console.log('Aktuelle UID:', uid);
    });
    this.isGuest = this.authService.isGuestUser();
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
