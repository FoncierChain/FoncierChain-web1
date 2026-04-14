import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'portal',
    loadComponent: () => import('./pages/portal/portal').then(m => m.Portal)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map-view').then(m => m.MapView)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
