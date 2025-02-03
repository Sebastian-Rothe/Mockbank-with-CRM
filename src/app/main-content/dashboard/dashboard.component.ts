import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// services
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedService } from '../../../services/shared.service';
import { DashboardDataServiceService } from '../../../services/dashboard-data-service.service';
// models
import { User } from '../../../models/user.class';
import { Account } from '../../../models/account.class';
// material
import { MatDialog } from '@angular/material/dialog';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
// components
import { DialogSendMoneyComponent } from '../../../dialogs/dialog-send-money/dialog-send-money.component';
import { DialogOpenNewPocketComponent } from '../../../dialogs/dialog-open-new-pocket/dialog-open-new-pocket.component';
import { DialogMoveMoneyComponent } from '../../../dialogs/dialog-move-money/dialog-move-money.component';
import { DialogEditAccountComponent } from '../../../dialogs/dialog-edit-account/dialog-edit-account.component';
import { DialogConfirmDeleteAccComponent } from '../../../dialogs/dialog-confirm-delete-acc/dialog-confirm-delete-acc.component';
import { TransfersComponent } from './transfers/transfers.component';
import { BankComponent } from '../bank/bank.component';
// charts
import { FirstChartsComponent } from '../../../charts/first-charts/first-charts.component';
import { MonthlyExpensesChartComponent } from '../../../charts/first-charts/monthly-expenses-chart/monthly-expenses-chart.component';
import { AccountsComponent } from './accounts/accounts.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCard,
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
    UserDashboardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null; 

  constructor(
    private authService: FirebaseAuthService,
    private firebaseService: FirebaseService,
    private dashboardData: DashboardDataServiceService,
    public dialog: MatDialog
  ) {}

 
  ngOnInit(): void {
    this.authService.uid$.subscribe((uid) => {
      console.log(uid, 'at dash');
      if (uid) {
        this.loadUser(uid);
        this.dashboardData.loadUser(uid);
      }
    });
  }

  async loadUser(uid: string): Promise<void> {
    try {
      this.user = await this.firebaseService.getUser(uid);
      }
     catch (error) {
      console.error('Error loading user:', error);
    }
  }

}
