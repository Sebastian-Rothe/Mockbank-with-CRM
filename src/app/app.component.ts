import { Component } from '@angular/core';
import { MainContentComponent } from './main-content/main-content.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { FooterComponent } from './footer/footer.component';
import { OpenNewAccountComponent } from './open-new-account/open-new-account.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainContentComponent, FrontpageComponent, FooterComponent, OpenNewAccountComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'basti-crm';
}

