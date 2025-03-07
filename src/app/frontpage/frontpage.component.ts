import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { FooterComponent } from '../shared-components/footer/footer.component';

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
export class FrontpageComponent {
  constructor(public dialog: MatDialog) {}

  openLoginDialog(): void {
    this.dialog.open(LoginComponent, {
      width: '400px', 
      disableClose: true, 
    });
  }
}
