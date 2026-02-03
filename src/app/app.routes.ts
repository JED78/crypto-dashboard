import { Routes } from '@angular/router';
import { TopGainersComponent } from './features/top-gainers/top-gainers';

export const routes: Routes = [
  { path: '', redirectTo: 'top-gainers', pathMatch: 'full' },
  { path: 'top-gainers', component: TopGainersComponent }
];
