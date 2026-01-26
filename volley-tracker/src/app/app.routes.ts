import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { SetupPage } from './setup/setup.page';
import { GroupsPage } from './groups/groups.page';
import { coachGuard } from '../core/coach.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'setup', component: SetupPage },
  { path: 'groups', component: GroupsPage, canActivate: [coachGuard] },
  { path: '**', redirectTo: '' },
];