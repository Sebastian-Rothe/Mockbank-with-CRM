import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../models/user.class';
import { Transfer } from '../../models/transfer.class';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-first-charts',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './first-charts.component.html',
  styleUrl: './first-charts.component.scss',
})
export class FirstChartsComponent {
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
      }
    });
    this.authService.user$.subscribe((user) => {
		if(user){
			this.user = user;
			this.loadUserAndTransfers();
		}
    });
  }
  async loadUserAndTransfers(): Promise<void> {
    try {
      //   const user = await this.firebaseService.getUser(userId);
      if (!this.user) {
        console.error('User not found.');
        return;
      }

      // Fetch all transfers for the user
      const allTransfers: Transfer[] =
        await this.firebaseService.getTransfersForUser(this.user);

      // Filter out transfers where sender and receiver have the same userId
      const filteredTransfers = allTransfers.filter(
        (transfer) => transfer.senderUserId !== transfer.receiverUserId
      );

      const categoryMap: { [key: string]: number } = {};

      // Group filtered transfers by category
      filteredTransfers.forEach((transfer) => {
        if (transfer.category) {
          categoryMap[transfer.category] =
            (categoryMap[transfer.category] || 0) + transfer.amount;
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
        theme: 'dark2',
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
