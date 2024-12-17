import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { FrontpageComponent } from './frontpage/frontpage.component';

export const routes: Routes = [
    { path: '', component: FrontpageComponent},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'user', component: UserComponent},
    { path: 'user/:id', component: UserDetailComponent}
];
