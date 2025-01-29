import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase.service';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { Transfer } from '../../../models/transfer.class';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-monthly-expenses-chart',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './monthly-expenses-chart.component.html',
  styleUrl: './monthly-expenses-chart.component.scss'
})
export class MonthlyExpensesChartComponent {
  uid: string = '';
  chartOptions: any;
   user: User = new User();

  constructor(
    private firebaseService: FirebaseService,
    private authService: FirebaseAuthService
  ) {}

  ngOnInit(): void {
    this.authService.uid$.subscribe((uid) => {
      if (uid) {
        this.uid = uid;
        this.loadMonthlyStats(this.uid);
      }
    });
  }
  async loadMonthlyStats(userId: string): Promise<void> {
    try {
      const user = await this.firebaseService.getUser(userId);
      if (!user) {
        console.error('User not found.');
        return;
      }
  
      this.user = user;
  
      // Fetch all transfers for the user
      const allTransfers: Transfer[] = await this.firebaseService.getTransfersForUser(this.user);
      const monthlyStats: { [month: string]: { income: number; expenses: number } } = {};
  
      const filteredTransfers = allTransfers.filter(
        (transfer) => transfer.senderUserId !== transfer.receiverUserId
        );
     filteredTransfers.forEach((transfer) => {
        const date = new Date(transfer.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: YYYY-MM
  
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { income: 0, expenses: 0 };
        }
  
        // Categorize as income or expense
        if (transfer.receiverUserId === this.user.uid) {
          monthlyStats[monthKey].income += transfer.amount;
        }
        if (transfer.senderUserId === this.user.uid) {
          monthlyStats[monthKey].expenses += transfer.amount;
        }
      });
  
      // Prepare data for the chart
      const months = Object.keys(monthlyStats).sort();
      const incomeDataPoints = months.map((month) => ({ label: month, y: monthlyStats[month].income }));
      const expenseDataPoints = months.map((month) => ({ label: month, y: monthlyStats[month].expenses }));
  
      // Set chart options
      this.chartOptions = {
        animationEnabled: true,
        theme: 'dark2',
        exportEnabled: true,
        title: { text: 'Monthly Income vs. Expenses' },
        axisX: { title: 'Month' },
        axisY: { title: 'Amount (€)', includeZero: true },
        data: [
          { type: 'column', name: 'Income', showInLegend: true, dataPoints: incomeDataPoints },
          { type: 'column', name: 'Expenses', showInLegend: true, dataPoints: expenseDataPoints },
        ],
      };
    } catch (error) {
      console.error('Error loading monthly stats:', error);
    }
  }
  
}
