import { Routes } from '@angular/router';
import { StandingComponent } from './pages/standings/standings';

export const routes: Routes = [
    { path: '', redirectTo: 'standings', pathMatch: 'full' },
    { path: 'standings', component: StandingComponent }
];
