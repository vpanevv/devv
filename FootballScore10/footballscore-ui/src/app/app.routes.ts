import { Routes } from '@angular/router';
import { StandingComponent } from './pages/standings/standings';
import { CreateTeamComponent } from './pages/teams/create-team';
import { EditTeamComponent } from './pages/teams/edit-team';

export const routes: Routes = [
    { path: '', redirectTo: 'standings', pathMatch: 'full' },
    { path: 'standings', component: StandingComponent },

    { path: 'teams/create', component: CreateTeamComponent },
    { path: 'teams/:id/edit', component: EditTeamComponent }
];
