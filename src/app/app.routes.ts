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
import { UserProfileComponent } from './main-content/user-profile/user-profile.component';
import { ChangeRoleComponent } from './main-content/change-role/change-role.component';
import { PrivacyPolicyComponent } from './shared-components/privacy-policy/privacy-policy.component';
import { StatisticsComponent } from './main-content/statistics/statistics.component';
import { HelpCenterComponent } from './shared-components/help-center/help-center.component';

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
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default-Route
      { path: 'imprint', component: ImprintComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'help-center', component: HelpCenterComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'user-profile', component: UserProfileComponent },
      { path: 'user', component: UserComponent },
      { path: 'user/:uid', component: UserDetailComponent },
      { path: 'new-admin', component: CreateNewAdminComponent },
      { path: 'change-role', component: ChangeRoleComponent },
      { path: 'statistics', component: StatisticsComponent },
    ],
  },
];
