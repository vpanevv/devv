import { Routes } from '@angular/router';
import { GroupsPage } from './groups/groups.page';
import { SetupPage } from './setup/setup.page';
import { coachGuard } from './core/coach.guard';

export const routes: Routes = [
  { path: 'setup', component: SetupPage },
  { path: '', component: GroupsPage, canMatch: [coachGuard] },
  { path: '**', redirectTo: '' },
];