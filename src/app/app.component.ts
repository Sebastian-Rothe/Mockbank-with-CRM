import { Component } from '@angular/core';
import { MainContentComponent } from './main-content/main-content.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { FooterComponent } from './footer/footer.component';
import { OpenNewAccountComponent } from './open-new-account/open-new-account.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainContentComponent, FrontpageComponent, FooterComponent, OpenNewAccountComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'basti-crm';
}

