import { Component, OnInit } from '@angular/core';
import { MainContentComponent } from './main-content/main-content.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { FooterComponent } from './shared-components/footer/footer.component';
import { OpenNewAccountComponent } from './frontpage/open-new-account/open-new-account.component';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './shared-components/loading/loading.component';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // MainContentComponent,
    // FrontpageComponent,
    // FooterComponent,
    // OpenNewAccountComponent,
    RouterOutlet,
    LoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'basti-crm';
  isLoading = false;

  constructor(private loadingService: LoadingService) {}

  ngOnInit() {
    this.loadingService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
}
