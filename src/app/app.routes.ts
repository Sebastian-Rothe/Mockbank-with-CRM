import { Routes } from '@angular/router';
import { DashboardComponent } from './main-content/dashboard/dashboard.component';
import { UserComponent } from './main-content/user/user.component';
import { UserDetailComponent } from './main-content/user-detail/user-detail.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { OpenNewAccountComponent } from './frontpage/open-new-account/open-new-account.component';
import { MainContentComponent } from './main-content/main-content.component';

export const routes: Routes = [
  { path: '', component: FrontpageComponent },
  {
    path: 'main',
    component: MainContentComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'user', component: UserComponent },
      { path: 'user/:id', component: UserDetailComponent },
    ],
  },
  { path: 'open-account', component: OpenNewAccountComponent },
];
