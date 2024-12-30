import { Routes } from '@angular/router';
import { DashboardComponent } from './main-content/dashboard/dashboard.component';
import { UserComponent } from './main-content/user/user.component';
import { UserDetailComponent } from './main-content/user-detail/user-detail.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { OpenNewAccountComponent } from './frontpage/open-new-account/open-new-account.component';
import { MainContentComponent } from './main-content/main-content.component';
import { MainAdminComponent } from './main-admin/main-admin.component';
import { AdminDashboardComponent } from './main-admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: FrontpageComponent },
  {
    path: 'main-user',
    component: MainContentComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default-Route
      { path: 'dashboard', component: DashboardComponent },
      { path: 'user', component: UserComponent },
      { path: 'user/:uid', component: UserDetailComponent },
    ],
  },
  {
    path: 'main-admin',
    component: MainAdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      // { path: 'manage-users', component: ManageUsersComponent },
    ],
  },
  { path: 'open-account', component: OpenNewAccountComponent },
];
