import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { SetupPage } from './setup/setup.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'setup', component: SetupPage },

  //temporary redirect to groups for now
  { path: 'groups', component: HomePage },

  { path: '**', redirectTo: '' },
];