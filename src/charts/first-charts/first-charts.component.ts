
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
 
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
@Component({
  selector: 'app-first-charts',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './first-charts.component.html',
  styleUrl: './first-charts.component.scss'
})
export class FirstChartsComponent {
  chartOptions = {
	  animationEnabled: true,
	  theme: "dark2",
	  exportEnabled: true,
	  title: {
		  text: "Developer Work Week"
	  },
	  subtitles: [{
		  text: "Median hours/week"
	  }],
	  data: [{
		  type: "doughnut", //change type to column, line, area, doughnut, etc
		  indexLabel: "{name}: {y}%",
		  dataPoints: [
		  	{ name: "Overhead", y: 9.1 },
		  	{ name: "Problem Solving", y: 3.7 },
		  	{ name: "Debugging", y: 36.4 },
		  	{ name: "Writing Code", y: 30.7 },
		  	{ name: "Firefighting", y: 20.1 }
		  ]
	  }]
	}
}
