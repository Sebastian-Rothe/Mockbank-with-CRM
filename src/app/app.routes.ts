import { Routes } from '@angular/router';
import { DashboardComponent } from './main-content/dashboard/dashboard.component';
import { UserComponent } from './main-content/user/user.component';
import { UserDetailComponent } from './main-content/user-detail/user-detail.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { OpenNewAccountComponent } from './frontpage/open-new-account/open-new-account.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CreateNewAdminComponent } from './main-content/create-new-admin/create-new-admin.component';
import { ImprintComponent } from './shared-components/imprint/imprint.component';
import { FrontpageContentComponent } from './frontpage/frontpage-content/frontpage-content.component';
import { ChangeRoleComponent } from './main-content/change-role/change-role.component';
import { PrivacyPolicyComponent } from './shared-components/privacy-policy/privacy-policy.component';
import { StatisticsComponent } from './main-content/statistics/statistics.component';
import { HelpCenterComponent } from './shared-components/help-center/help-center.component';

// Guards
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: FrontpageComponent,
    children: [
      { path: '', component: FrontpageContentComponent },
      { path: 'imprint', component: ImprintComponent },
      { path: 'open-account', component: OpenNewAccountComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'help-center', component: HelpCenterComponent },
    ],
  },
  {
    path: 'main',
    component: MainContentComponent,
    canActivate: [authGuard], // Protect all /main routes
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'imprint', component: ImprintComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'help-center', component: HelpCenterComponent },
      { path: 'dashboard', component: DashboardComponent },
      { 
        path: 'user', 
        component: UserComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'management'] } // Only admins can search users
      },
      { path: 'user/:uid', component: UserDetailComponent },
      { 
        path: 'new-admin', 
        component: CreateNewAdminComponent,
        canActivate: [roleGuard, guestGuard],
        data: { roles: ['admin', 'management'] } // Only admins, no guests
      },
      { 
        path: 'change-role', 
        component: ChangeRoleComponent,
        // Only for guests to upgrade their account
      },
      { path: 'statistics', component: StatisticsComponent },
    ],
  },
];
