import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { TransferService } from '../../services/transfer.service';
import { User } from '../../models/user.class';
import { Transfer } from '../../models/transfer.class';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-income-expenses-chart',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './income-expenses-chart.component.html',
  styleUrl: './income-expenses-chart.component.scss',
})
export class IncomeExpensesChartComponent {
  chartOptions: any;
  user: User = new User();

  constructor(
    private authService: FirebaseAuthService,
    private transferService: TransferService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
		if(user){
			this.user = user;
			this.loadUserAndTransfers();
		}
    });
  }
  async loadUserAndTransfers(): Promise<void> {
    try {
      if (!this.user) {
        console.error('User not found.');
        return;
      }

      // Fetch all transfers for the user
      const allTransfers: Transfer[] = await this.transferService.getTransfersForUser(this.user);

      // Filter out transfers where sender and receiver have the same userId
      const filteredTransfers = allTransfers.filter(
        (transfer) => transfer.senderUserId !== transfer.receiverUserId
      );

      const categoryMap: { [key: string]: number } = {};

      // Group filtered transfers by category
      filteredTransfers.forEach((transfer) => {
        if (transfer.category) {
          const amount = transfer.receiverUserId === this.user.uid ? transfer.amount : -transfer.amount;
          categoryMap[transfer.category] = (categoryMap[transfer.category] || 0) + amount;
        }
      });

      // Prepare data for the chart
      const dataPoints = Object.keys(categoryMap).map((category) => ({
        name: category,
        y: categoryMap[category],
      }));

      // Set chart options
      this.chartOptions = {
        animationEnabled: true,
        theme: 'light',
        exportEnabled: true,
        title: { text: 'Transfers by Category' },
        subtitles: [{ text: 'Distribution by Amount' }],
        data: [{ type: 'doughnut', indexLabel: '{name}: {y}€', dataPoints }],
      };
    } catch (error) {
      console.error('Error loading transfers:', error);
    }
  }

}