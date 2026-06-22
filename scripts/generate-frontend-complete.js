/**
 * Complete clinic-frontend app generator — run after generate-frontend.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let count = 0;
function w(rel, c) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, c, 'utf8');
  count++;
}

// ===== AUTH & PERMISSION SERVICES =====
w('clinic-frontend/src/app/core/services/auth.service.ts', `import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, tap, map } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { TokenStorageService } from '../auth/token-storage.service';
import { JwtUtils } from '../utils/jwt-utils';
import { normalizeFileUrlsInValue } from '../utils/file-url-utils';
import { ApiResponse } from '../models/api-response.model';
import { CurrentUser, LoginRequest, LoginResponse, PermissionMap, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly activeRoleChanged$ = new Subject<void>();
  readonly activeRoleChanged = this.activeRoleChanged$.asObservable();

  constructor(private readonly api: ApiService, private readonly tokenStorage: TokenStorageService, private readonly router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    const email = request.email?.trim();
    const payload: LoginRequest = { ...request, email, username: email };
    return this.api.post<ApiResponse<LoginResponse>>(AppConstants.API.AUTH_LOGIN, payload).pipe(
      tap((res) => {
        if (res.data?.accessToken) {
          this.tokenStorage.setToken(res.data.accessToken);
          if (res.data.refreshToken) this.tokenStorage.setRefreshToken(res.data.refreshToken);
          const userDto = res.data.user;
          if (!userDto) return;
          const extraRoles = Array.isArray(userDto.extraRoles) ? (userDto.extraRoles as UserRole[]) : [];
          const user: CurrentUser = {
            id: userDto.id, username: userDto.username, email: userDto.email, fullName: userDto.fullName,
            fullNameAr: userDto.fullNameAr, fullNameEn: userDto.fullNameEn, profileImageUrl: userDto.profileImageUrl,
            role: userDto.role, activeRole: userDto.role, extraRoles, doctorId: userDto.doctorId,
            permissions: userDto.permissions, initials: this.buildInitials(userDto.fullNameAr || userDto.fullNameEn || userDto.fullName),
            mustChangePassword: userDto.mustChangePassword ?? false
          };
          this.tokenStorage.setUser(user);
        }
      }),
      map((res) => { if (!res.success || !res.data) throw new Error(res.message || 'Login failed'); return res.data; })
    );
  }

  logout(): void {
    this.api.post<ApiResponse<void>>(AppConstants.API.AUTH_LOGOUT, {}).subscribe({ error: () => {} });
    this.tokenStorage.clearAll();
    void this.router.navigateByUrl('/auth/login');
  }

  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    return !!token && !JwtUtils.isExpired(token);
  }

  getCurrentUser(): CurrentUser | null {
    const user = this.tokenStorage.getUser<CurrentUser>();
    if (!user) return null;
    const normalized = normalizeFileUrlsInValue(user);
    if (normalized !== user) this.tokenStorage.setUser(normalized);
    return normalized;
  }

  getRole(): UserRole | null { return this.getCurrentUser()?.activeRole ?? this.getCurrentUser()?.role ?? null; }

  getEffectiveRoles(): UserRole[] {
    const u = this.getCurrentUser();
    if (!u) return [];
    const out: UserRole[] = [];
    const seen = new Set<UserRole>();
    for (const r of [u.role, ...(u.extraRoles ?? [])]) {
      if (r && !seen.has(r)) { seen.add(r); out.push(r); }
    }
    return out;
  }

  setActiveRole(role: UserRole): void {
    const user = this.getCurrentUser();
    if (!user || !this.getEffectiveRoles().includes(role)) return;
    this.tokenStorage.setUser({ ...user, activeRole: role });
    this.activeRoleChanged$.next();
  }

  getPermissions(): PermissionMap { return this.getCurrentUser()?.permissions ?? {}; }
  updateStoredPermissions(permissions: PermissionMap): void {
    const user = this.getCurrentUser();
    if (user) this.tokenStorage.setUser({ ...user, permissions });
  }

  isAdmin(): boolean { return this.hasRole('ADMIN'); }
  hasRole(role: UserRole): boolean { return this.getRole() === role; }
  mustChangePassword(): boolean { return this.getCurrentUser()?.mustChangePassword === true; }
  clearExpiredTokens(): void {
    const token = this.tokenStorage.getToken();
    if (token && JwtUtils.isExpired(token)) this.tokenStorage.clearAll();
  }

  getDashboardRoute(): string { return '/admin/dashboard'; }

  private buildInitials(name: string): string {
    const words = (name ?? '').trim().split(/\\s+/).filter(Boolean);
    if (!words.length) return 'U';
    return words.slice(0, 2).map((x) => x[0]?.toUpperCase() ?? '').join('');
  }
}
`);

w('clinic-frontend/src/app/core/services/permission.service.ts', `import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { AuthService } from './auth.service';
import { PermissionAction, PermissionMap, UserRole } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

export interface RolePermissionDto { role: UserRole; permissions: PermissionMap; }

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissions: PermissionMap = {};
  constructor(private readonly api: ApiService, private readonly auth: AuthService) {
    this.permissions = this.auth.getPermissions();
  }

  loadMine(): Observable<ApiResponse<RolePermissionDto> | null> {
    if (!this.auth.isAuthenticated()) return of(null);
    const activeRole = this.auth.getRole();
    return this.api.get<ApiResponse<RolePermissionDto>>(AppConstants.API.ROLE_PERMISSIONS_ME, activeRole ? { role: activeRole } : undefined).pipe(
      tap((res) => {
        const permissions = res.data?.permissions ?? {};
        this.permissions = permissions;
        this.auth.updateStoredPermissions(permissions);
      })
    );
  }

  can(moduleKey: string, action: PermissionAction = 'view'): boolean {
    if (this.auth.hasRole('ADMIN')) return true;
    const module = this.permissions[moduleKey];
    if (!module || module.enabled === false) return false;
    return module[action] === true;
  }

  getPermissions(): PermissionMap { return this.permissions; }
}
`);

w('clinic-frontend/src/app/core/guards/auth.guard.ts', `import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionAction } from '../models/user.model';
import { PermissionService } from '../services/permission.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return router.createUrlTree([auth.getDashboardRoute()]);
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  const role = auth.getRole();
  const allowed: string[] = ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGY_STAFF', 'CASHIER'];
  if (role && allowed.includes(role)) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const permissions = inject(PermissionService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  const moduleKey = route.data['permission'] as string | undefined;
  const action = (route.data['permissionAction'] as PermissionAction | undefined) ?? 'view';
  if (!moduleKey || permissions.can(moduleKey, action)) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};
`);

// ===== APP ROOT =====
w('clinic-frontend/src/app/app.component.ts', `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
@Component({
  selector: 'app-root', standalone: true,
  imports: [RouterOutlet, LoadingSpinnerComponent],
  template: \`<app-loading-spinner></app-loading-spinner><router-outlet></router-outlet>\`
})
export class AppComponent {}
`);

w('clinic-frontend/src/app/app.routes.ts', `import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: 'admin', canActivate: [authGuard], loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
  { path: 'queue/tv', loadComponent: () => import('./features/queue/queue-tv/queue-tv.component').then((m) => m.QueueTvComponent) },
  { path: '**', redirectTo: 'auth/login' }
];
`);

w('clinic-frontend/src/app/app.config.ts', `import { ApplicationConfig, APP_INITIALIZER, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { DateFormatAdapter } from './core/adapters/date-format.adapter';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { PermissionService } from './core/services/permission.service';

export const DD_MM_YYYY_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: { dateInput: 'dd/MM/yyyy', monthYearLabel: 'MMM yyyy', dateA11yLabel: 'dd/MM/yyyy', monthYearA11yLabel: 'MMMM yyyy' }
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_INITIALIZER, useFactory: (theme: ThemeService) => () => { theme.mode; }, deps: [ThemeService], multi: true },
    { provide: APP_INITIALIZER, useFactory: (auth: AuthService) => () => auth.clearExpiredTokens(), deps: [AuthService], multi: true },
    { provide: APP_INITIALIZER, useFactory: (permissions: PermissionService) => () => permissions.loadMine(), deps: [PermissionService], multi: true },
    provideRouter(routes), provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'en-US' }, { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: DateFormatAdapter }, { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_DATE_FORMATS },
    provideHttpClient(withInterceptors([loadingInterceptor, languageInterceptor, authInterceptor, errorInterceptor])),
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useFactory: () => ({ direction: (localStorage.getItem('cm_lang') || 'ar') === 'ar' ? 'rtl' : 'ltr', maxWidth: '95vw' }) },
    importProvidersFrom(MatSnackBarModule, MatDialogModule, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateHttpLoader } }))
  ]
};
`);

w('clinic-frontend/src/app/features/auth/auth.routes.ts', `import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/auth.guard';
export const AUTH_ROUTES: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent) },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
`);

w('clinic-frontend/src/app/shared/directives/has-permission.directive.ts', `import { Directive, Input, OnChanges, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionAction } from '../../core/models/user.model';
import { PermissionService } from '../../core/services/permission.service';
import { AuthService } from '../../core/services/auth.service';
@Directive({ selector: '[appCan]', standalone: true })
export class HasPermissionDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appCan') module!: string;
  @Input('appCanAction') action: PermissionAction = 'view';
  private hasView = false;
  private roleChangeSub?: Subscription;
  constructor(private readonly templateRef: TemplateRef<unknown>, private readonly viewContainer: ViewContainerRef,
    private readonly permissions: PermissionService, private readonly auth: AuthService) {}
  ngOnInit(): void {
    this.updateView();
    this.roleChangeSub = this.auth.activeRoleChanged.subscribe(() => this.updateView());
  }
  ngOnChanges(): void { this.updateView(); }
  ngOnDestroy(): void { this.roleChangeSub?.unsubscribe(); }
  private updateView(): void {
    const allowed = this.permissions.can(this.module, this.action);
    if (allowed && !this.hasView) { this.viewContainer.createEmbeddedView(this.templateRef); this.hasView = true; }
    else if (!allowed && this.hasView) { this.viewContainer.clear(); this.hasView = false; }
  }
}
`);

w('clinic-frontend/src/app/shared/components/loading-spinner/loading-spinner.component.ts', `import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '../../../core/services/loading.service';
@Component({
  selector: 'app-loading-spinner', standalone: true, imports: [AsyncPipe, NgIf, TranslateModule],
  template: \`<div class="app-loading-shell" *ngIf="loading.isLoading$ | async" aria-live="polite"><div class="app-loading-veil"></div><div class="app-loading-bar"></div><div class="app-loading-pill"><span class="app-loading-ring"></span><span class="app-loading-text">{{ 'COMMON.LOADING' | translate }}</span></div></div>\`,
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent { constructor(readonly loading: LoadingService) {} }
`);

w('clinic-frontend/src/app/shared/components/loading-spinner/loading-spinner.component.scss', `:host { display: contents; }
`);

w('clinic-frontend/src/app/shared/components/page-header/page-header.component.ts', `import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-page-header', standalone: true, imports: [NgIf, TranslateModule],
  template: \`<header class="app-page-header"><div class="page-heading"><p class="app-page-eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p><h1 class="app-page-title">{{ title }}</h1><p class="app-page-subtitle" *ngIf="subtitle">{{ subtitle }}</p></div><div class="page-actions"><ng-content></ng-content></div></header>\`,
  styles: [\`:host { display: block; } .page-heading { min-width: 0; } .page-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }\`]
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
}
`);

console.log('Core app files:', count);

// ===== DOMAIN MODELS =====
const models = {
  patient: `export interface Patient {
  id: number; patientCode: string; firstName: string; lastName: string;
  nationalId?: string; dateOfBirth?: string; gender?: string; phone?: string; email?: string;
  address?: string; allergies?: string; chronicDiseases?: string; isActive?: boolean;
}`,
  doctor: `export interface Doctor {
  id: number; doctorCode: string; firstName: string; lastName: string;
  specialty: string; department?: string; phone?: string; email?: string;
  consultationFee?: number; isActive?: boolean;
}
export interface DoctorSchedule {
  id: number; doctorId: number; dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean;
}`,
  appointment: `export interface Appointment {
  id: number; appointmentNo: string; patientId: number; doctorId: number;
  patientName?: string; doctorName?: string;
  appointmentDate: string; startTime: string; endTime?: string;
  status: string; appointmentType?: string; notes?: string;
}`,
  queue: `export interface QueueToken {
  id: number; tokenNumber: number; queueDate: string; doctorId?: number;
  patientId: number; patientName?: string; appointmentId?: number; status: string;
}`,
  consultation: `export interface Consultation {
  id: number; appointmentId?: number; patientId: number; doctorId: number;
  chiefComplaint?: string; diagnosis?: string; vitalsJson?: string; notes?: string; status?: string;
}`,
  prescription: `export interface Prescription {
  id: number; prescriptionNo: string; patientId: number; doctorId: number;
  consultationId?: number; status?: string; notes?: string; items?: PrescriptionItem[];
}
export interface PrescriptionItem {
  id?: number; medicineName: string; dosage?: string; frequency?: string; duration?: string; notes?: string;
}`,
  lab: `export interface LabRequest {
  id: number; requestNo: string; patientId: number; doctorId?: number;
  testType: string; testCategory?: string; status: string; notes?: string;
}`,
  radiology: `export interface RadiologyRequest {
  id: number; requestNo: string; patientId: number; doctorId?: number;
  studyType: string; status: string; scheduledAt?: string; notes?: string;
}`,
  billing: `export interface Invoice {
  id: number; invoiceNo: string; patientId: number; patientName?: string;
  status: string; subtotal?: number; discount?: number; tax?: number; total: number; paidAmount?: number;
}
export interface Payment {
  id: number; invoiceId: number; amount: number; paymentMethod: string; referenceNo?: string; paidAt?: string;
}`,
  insurance: `export interface InsuranceProvider {
  id: number; name: string; contactPhone?: string; contactEmail?: string; coverageNotes?: string; isActive?: boolean;
}
export interface InsuranceClaim {
  id: number; claimNo: string; patientId: number; providerId?: number; amount: number; status: string;
}`,
  dashboard: `export interface DashboardStats {
  patientsToday?: number; appointmentsToday?: number; queueWaiting?: number; revenueToday?: number; revenueMonth?: number;
}
export interface ChartPoint { label: string; value: number; }`,
  settings: `export interface ClinicSetting { key: string; value: string; label?: string; }`
};

Object.entries(models).forEach(([name, body]) => {
  w(`clinic-frontend/src/app/core/models/${name}.model.ts`, body);
});

console.log('Total files so far:', count);
module.exports = { w, count: () => count };
