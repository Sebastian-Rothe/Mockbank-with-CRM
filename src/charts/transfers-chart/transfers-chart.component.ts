import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Transfer } from '../../models/transfer.class';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-transfers-chart',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './transfers-chart.component.html',
  styleUrl: './transfers-chart.component.scss'
})
export class TransfersChartComponent implements OnInit {
  chartOptions: any;
  transferCountData: { x: Date, y: number }[] = [];
  transferAmountData: { x: Date, y: number }[] = [];

  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    await this.getTransfersPerDay();
    console.log('📊 Final dataPoints für Transfer-Chart:', this.transferCountData, this.transferAmountData);
    this.loadChart();
  }

  async getTransfersPerDay() {
    const transfers: Transfer[] = await this.firebaseService.getAllTransfers();
    console.log('📤 Alle Transfers aus Firestore:', transfers);

    const groupedData: Record<string, { count: number; totalAmount: number }> = {};

    // Gruppiere Transfers nach Datum
    transfers.forEach((transfer) => {
      if (transfer.createdAt && typeof transfer.createdAt === 'number') {
        const dateString = new Date(transfer.createdAt).toISOString().split('T')[0];

        if (!groupedData[dateString]) {
          groupedData[dateString] = { count: 0, totalAmount: 0 };
        }

        groupedData[dateString].count++;
        groupedData[dateString].totalAmount += transfer.amount;
      }
    });

    console.log('📅 Gruppierte Transfers nach Datum:', groupedData);

    // Daten in Arrays für das Chart umwandeln
    this.transferCountData = [];
    this.transferAmountData = [];

    Object.entries(groupedData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .forEach(([date, values]) => {
        this.transferCountData.push({ x: new Date(date), y: values.count });
        this.transferAmountData.push({ x: new Date(date), y: values.totalAmount });
      });
  }

  loadChart() {
    this.chartOptions = {
      animationEnabled: true,
      theme: 'dark2',
      title: { text: 'Transfers per Day & Total Amount (€)' },
      axisX: { title: 'Date', valueFormatString: 'DD MMM' },
      axisY: { title: 'Number of Transfers', minimum: 0 },
      axisY2: { title: 'Total Amount (€)', minimum: 0, lineColor: 'orange', tickColor: 'orange', labelFontColor: 'orange' },
      legend: { cursor: 'pointer', itemclick: (e: any) => this.toggleDataSeries(e) },
      toolTip: { shared: true },
      data: [
        {
          type: 'line',
          name: 'Amount of Transfers',
          showInLegend: true,
          dataPoints: this.transferCountData
        },
        {
          type: 'line',
          name: 'Total Amount (€)',
          axisYType: 'secondary',
          showInLegend: true,
          lineColor: 'orange',
          dataPoints: this.transferAmountData
        }
      ]
    };
  }

  toggleDataSeries(e: any) {
    if (e.dataSeries.visible === undefined || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    e.chart.render();
  }
}
