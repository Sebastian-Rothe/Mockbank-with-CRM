import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { FooterComponent } from '../footer/footer.component';
import { ImprintComponent } from './imprint/imprint.component';
import { FrontpageContentComponent } from './frontpage-content/frontpage-content.component';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, FooterComponent, ImprintComponent, FrontpageContentComponent, RouterOutlet],
  templateUrl: './frontpage.component.html',
  styleUrl: './frontpage.component.scss'
})
export class FrontpageComponent {
  constructor(public dialog: MatDialog) {}

  openLoginDialog(): void {
    this.dialog.open(LoginComponent, {
      width: '400px', // Optional: Passe die Größe des Dialogs an
      disableClose: true, // Optional: Verhindert das Schließen des Dialogs durch Klicken außerhalb
    });
}
}
