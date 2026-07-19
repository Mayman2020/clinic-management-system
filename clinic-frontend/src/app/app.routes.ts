import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: 'admin', canActivate: [authGuard], loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
  { path: 'access-denied', loadComponent: () => import('./features/errors/access-denied/access-denied.component').then((m) => m.AccessDeniedComponent) },
  { path: 'queue/tv', loadComponent: () => import('./features/queue/queue-tv/queue-tv.component').then((m) => m.QueueTvComponent) },
  { path: '**', redirectTo: 'auth/login' }
];
