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
    path: 'register',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map-view').then(m => m.MapView)
  },
  { 
    path: 'registry', 
    loadComponent: () => import('./pages/registry/registry').then(m => m.Registry)
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./pages/reports/reports').then(m => m.Reports)
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
  },
  { 
    path: 'help', 
    loadComponent: () => import('./pages/help/help').then(m => m.Help)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
