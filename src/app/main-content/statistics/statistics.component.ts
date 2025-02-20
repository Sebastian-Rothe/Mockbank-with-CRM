import { Component } from '@angular/core';
import { FirstChartsComponent } from '../../../charts/first-charts/first-charts.component';
import { MonthlyExpensesChartComponent } from '../../../charts/monthly-expenses-chart/monthly-expenses-chart.component';
import { UserGrowthChartComponent } from '../../../charts/user-growth-chart/user-growth-chart.component';
import { TransfersChartComponent } from '../../../charts/transfers-chart/transfers-chart.component';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { User } from '../../../models/user.class';
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    FirstChartsComponent,
    MonthlyExpensesChartComponent,
    TransfersChartComponent,
    UserGrowthChartComponent,
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
    user: User | null = null; 
    user$ = this.authService.user$; 
  
  
    constructor(
      private authService: FirebaseAuthService,
     
    ) {}
  
   
    ngOnInit(): void {
      this.user$.subscribe(user => {
        this.user = user;
        if (user) {
          console.log(user.role);
        } else {
          console.log('User is null');
        }
      });
    }
  }    
