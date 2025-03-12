import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { User } from '../../models/user.class';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-growth-chart',
  standalone: true,
  imports: [CanvasJSAngularChartsModule, CommonModule ],
  templateUrl: './user-growth-chart.component.html',
  styleUrl: './user-growth-chart.component.scss'
})

export class UserGrowthChartComponent implements OnInit {
  dataPoints: { x: Date, y: number }[] = [];
  chartOptions: any;
  errorMessage: string = '';

  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.dataPoints = await this.getUserData();
    console.log('📊 Final dataPoints für Chart:', this.dataPoints); // Debugging
    this.loadChart();
  }
  


  async getUserData(): Promise<{ x: Date, y: number }[]> {
    const users: User[] = await this.userService.getAllUsers();
  
    if (users.length === 0) {
      this.errorMessage = 'No User found!';
      return [];
    }
  
    this.errorMessage = ''; // Falls es vorher einen Fehler gab, zurücksetzen
    let count = 0;
    const groupedData: Record<string, number> = {};
  
    users.forEach((user) => {
      if (user.createdAt && typeof user.createdAt === 'number') {
        const date = new Date(user.createdAt);
        if (!isNaN(date.getTime())) {
          const dateString = date.toISOString().split('T')[0];
          groupedData[dateString] = (groupedData[dateString] || 0) + 1;
        }
      }
    });
  
    return Object.entries(groupedData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, value]) => {
        count += value;
        return { x: new Date(date), y: count };
      });
  }
  
  

  loadChart() {
    this.chartOptions = {
      animationEnabled: true,
      theme: 'light',
      title: { text: 'Total Number of Users (Daily)' },
      axisX: { title: 'Date', valueFormatString: 'DD MMM' },
      axisY: { title: 'Number of Users', minimum: 0 },
      data: [{ type: 'line', dataPoints: [] }]
    };
  
    // Warte kurz, dann Daten zuweisen (Angular erkennt das Update besser)
    setTimeout(() => {
      this.chartOptions = Object.assign({}, this.chartOptions, {
        data: [{ type: 'line', dataPoints: this.dataPoints }]
      });
    }, 100);
  }
  
  
  
}