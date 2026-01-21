import { Routes } from '@angular/router';
import { SetupPage } from './setup/setup.page';
import { GroupsPage } from './groups/groups.page';
import { PlayersPage } from './players/players.page';

export const routes: Routes = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: 'setup', component: SetupPage },
  { path: 'groups', component: GroupsPage },
  { path: 'groups/:groupId/players', component: PlayersPage },
  { path: '**', redirectTo: 'setup' },
];