import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { FooterComponent } from '../shared-components/footer/footer.component';
import { SummaryComponent } from '../shared-components/summary/summary.component';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    FooterComponent,
    RouterOutlet,
  ],
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.scss',
})
export class FrontpageComponent implements OnInit {
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.openSummaryDialog();
  }

  openLoginDialog(): void {
    this.dialog.open(LoginComponent, {
      width: '400px', 
      disableClose: true, 
    });
  }

  openSummaryDialog(): void {
    this.dialog.open(SummaryComponent, {
      width: '800px',
      data: {
        message: 'You can also read this overview in the Help Center.'
      }
    });
  }
}
