import { Routes } from '@angular/router';
import { TopGainersComponent } from './features/top-gainers/top-gainers';
import { Dashboard } from '../app/dashboard/dashboard';
import { TopCripto } from './features/top-cripto/top-cripto';
import { AlertsComponent } from './features/alerts/alerts';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'topGainers', component: TopGainersComponent },
  { path: 'TopCripto', component: TopCripto },
   { path: 'AlertsComponent', component: AlertsComponent }
  
];
