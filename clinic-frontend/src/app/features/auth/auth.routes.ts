import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/auth.guard';
export const AUTH_ROUTES: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent) },
  { path: 'forgot-password', canActivate: [guestGuard], loadComponent: () => import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
