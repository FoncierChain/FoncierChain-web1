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
    path: 'parcels', 
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  { 
    path: 'registry', 
    loadComponent: () => import('./pages/portal/portal').then(m => m.Portal)
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
