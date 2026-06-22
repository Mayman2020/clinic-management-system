/**
 * Generates remaining clinic-frontend files: services, layout, features.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let n = 0;
function w(rel, c) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, c, 'utf8');
  n++;
}

// --- Core services ---
w('clinic-frontend/src/app/core/auth/token-storage.service.ts', `import { Injectable } from '@angular/core';
import { AppConstants } from '../constants/app-constants';
const TOKEN_KEY = AppConstants.PERSISTED_KEYS.ACCESS_TOKEN;
const REFRESH_KEY = AppConstants.PERSISTED_KEYS.REFRESH_TOKEN;
const USER_KEY = AppConstants.PERSISTED_KEYS.CURRENT_USER;
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
  setToken(token: string): void { localStorage.setItem(TOKEN_KEY, token); }
  getRefreshToken(): string | null { return localStorage.getItem(REFRESH_KEY); }
  setRefreshToken(token: string): void { localStorage.setItem(REFRESH_KEY, token); }
  setUser(user: object): void { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }
  clearAll(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
`);

w('clinic-frontend/src/app/core/services/api.service.ts', `import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AppConstants } from '../constants/app-constants';
import { normalizeFileUrl, normalizeFileUrlsInValue } from '../utils/file-url-utils';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = this.resolveApiBase();
  constructor(private readonly http: HttpClient) {}
  private resolveApiBase(): string {
    const runtimeApi = (window as Window & { __CM_API_URL__?: string }).__CM_API_URL__;
    return (runtimeApi && runtimeApi.trim()) ? runtimeApi : AppConstants.API.baseURL;
  }
  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) httpParams = httpParams.set(k, String(v)); });
    return this.normalizeResponse(this.http.get<T>(\`\${this.base}\${path}\`, { params: httpParams }));
  }
  post<T>(path: string, body: unknown): Observable<T> { return this.normalizeResponse(this.http.post<T>(\`\${this.base}\${path}\`, body)); }
  put<T>(path: string, body: unknown): Observable<T> { return this.normalizeResponse(this.http.put<T>(\`\${this.base}\${path}\`, body)); }
  patch<T>(path: string, body?: unknown): Observable<T> { return this.normalizeResponse(this.http.patch<T>(\`\${this.base}\${path}\`, body ?? {})); }
  delete<T>(path: string): Observable<T> { return this.normalizeResponse(this.http.delete<T>(\`\${this.base}\${path}\`)); }
  buildUrl(path: string): string { return \`\${this.base}\${path}\`; }
  uploadFile(file: File): Observable<{ url: string; filename?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; data?: { url?: string; filename?: string } }>(\`\${this.base}\${AppConstants.API.FILES_UPLOAD}\`, formData)
      .pipe(timeout(180_000), map((res) => ({ url: res?.data?.url ? normalizeFileUrl(res.data.url) : '', filename: res?.data?.filename })));
  }
  private normalizeResponse<T>(response: Observable<T>): Observable<T> {
    return response.pipe(map((value) => normalizeFileUrlsInValue(value)));
  }
}
`);

w('clinic-frontend/src/app/core/services/loading.service.ts', `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private readonly subject = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.subject.pipe(distinctUntilChanged());
  show(): void { this.count++; this.subject.next(true); }
  hide(): void { this.count = Math.max(0, this.count - 1); if (this.count === 0) this.subject.next(false); }
}
`);

w('clinic-frontend/src/app/core/services/theme.service.ts', `import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
export type ThemeMode = 'light' | 'dark';
const STORAGE_KEY = 'cm_theme';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly subject = new BehaviorSubject<ThemeMode>(this.readInitialTheme());
  readonly isDark$: Observable<boolean> = this.subject.pipe(map((m) => m === 'dark'), distinctUntilChanged());
  constructor(private readonly overlayContainer: OverlayContainer) { this.applyTheme(this.subject.value); }
  get isDark(): boolean { return this.subject.value === 'dark'; }
  get mode(): ThemeMode { return this.subject.value; }
  toggle(): void { this.setTheme(this.subject.value === 'dark' ? 'light' : 'dark'); }
  setTheme(mode: ThemeMode): void {
    this.subject.next(mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
    this.applyTheme(mode);
  }
  private readInitialTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* ignore */ }
    return window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }
  private applyTheme(mode: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    let overlay: HTMLElement | null = null;
    try { overlay = this.overlayContainer.getContainerElement(); } catch { overlay = null; }
    if (mode === 'dark') { el.classList.add('dark-theme'); overlay?.classList.add('dark-theme'); }
    else { el.classList.remove('dark-theme'); overlay?.classList.remove('dark-theme'); }
  }
}
`);

w('clinic-frontend/src/app/core/services/snack.service.ts', `import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { resolveUserMessage } from '../utils/user-message.util';
@Injectable({ providedIn: 'root' })
export class SnackService {
  constructor(private readonly snack: MatSnackBar, private readonly translate: TranslateService) {}
  success(message: string): void { this.open(resolveUserMessage(message, this.translate), 'success-snack', 3500); }
  error(message: string): void { this.open(resolveUserMessage(message, this.translate), 'error-snack', 5000); }
  info(message: string): void { this.open(resolveUserMessage(message, this.translate), 'info-snack', 3000); }
  private open(message: string, panelClass: string, duration: number): void {
    this.snack.open(message, '✕', { duration, panelClass: [panelClass], horizontalPosition: 'end' });
  }
}
`);

w('clinic-frontend/src/app/core/services/navigation-history.service.ts', `import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  previousUrl: string | null = null;
  enteredFromMenu = false;
  private currentUrl = '';
  constructor(router: Router) {
    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      if (this.currentUrl) this.previousUrl = this.currentUrl;
      this.currentUrl = url;
      this.enteredFromMenu = false;
    });
  }
  markFromMenu(): void { this.enteredFromMenu = true; }
}
`);

// interceptors
w('clinic-frontend/src/app/core/interceptors/auth.interceptor.ts', `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { HTTP_HEADERS } from '../constants/app-constants';
import { CurrentUser } from '../models/user.model';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser<CurrentUser>();
  const activeRole = user?.activeRole ?? user?.role;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = \`Bearer \${token}\`;
  if (activeRole) headers[HTTP_HEADERS.ACTIVE_ROLE] = activeRole;
  return Object.keys(headers).length ? next(req.clone({ setHeaders: headers })) : next(req);
};
`);

w('clinic-frontend/src/app/core/interceptors/language.interceptor.ts', `import { HttpInterceptorFn } from '@angular/common/http';
const STORAGE_KEY = 'cm_lang';
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const lang = (saved === 'ar' || saved === 'en') ? saved : 'ar';
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
`);

w('clinic-frontend/src/app/core/interceptors/loading.interceptor.ts', `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { shouldSkipGlobalLoaderForUpload } from '../constants/app-constants';
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url ?? '';
  const method = req.method.toUpperCase();
  if (url.includes('/assets/i18n/') || url.includes('/assets/runtime-config.js') || method === 'GET' ||
      shouldSkipGlobalLoaderForUpload(url, method) || url.includes('/auth/login') || url.includes('/auth/logout')) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
`);

w('clinic-frontend/src/app/core/interceptors/error.interceptor.ts', `import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { AppConstants } from '../constants/app-constants';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);
  const translate = inject(TranslateService);
  return next(req).pipe(catchError((err: HttpErrorResponse) => {
    if (err.status === 401 && !req.url.includes(AppConstants.API.AUTH_LOGIN)) {
      tokenStorage.clearAll();
      void router.navigateByUrl('/auth/login');
    }
    const body = err.error;
    let message = err.message ?? '';
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      message = (body as Record<string, unknown>)['message'] as string || message;
    }
    const key = (message ?? '').trim();
    if (key && /^[A-Z0-9_.-]+$/.test(key)) {
      const t = translate.instant(key);
      if (t && t !== key) message = t;
    }
    if (!message) message = translate.instant('ERRORS.GENERIC');
    const normalizedError = new Error(message) as Error & { status?: number };
    normalizedError.status = err.status;
    return throwError(() => normalizedError);
  }));
};
`);

console.log('Part 1:', n, 'files');

module.exports = { w, count: () => n };
