import { Component } from '@angular/core';
import { MainContentComponent } from './main-content/main-content.component';
import { FrontpageComponent } from './frontpage/frontpage.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainContentComponent, FrontpageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'basti-crm';
}

