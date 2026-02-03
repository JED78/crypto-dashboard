import { Routes } from '@angular/router';
import { TopGainersComponent } from './features/top-gainers/top-gainers';
import { Dashboard } from '../app/dashboard/dashboard';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'topGainers', component: TopGainersComponent }
];
