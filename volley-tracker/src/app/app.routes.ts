import { Routes } from '@angular/router';
import { SetupPage } from './setup/setup.page';
import { GroupsPage } from './groups/groups.page';

export const routes: Routes = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: 'setup', component: SetupPage },
  { path: 'groups', component: GroupsPage },
  { path: '**', redirectTo: 'setup' },
];