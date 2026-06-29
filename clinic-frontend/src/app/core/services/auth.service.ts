import { Injectable } from '@angular/core';
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
    const username = request.username?.trim();
    const payload: LoginRequest = { username, password: request.password };
    return this.api.post<ApiResponse<LoginResponse>>(AppConstants.API.AUTH_LOGIN, payload).pipe(
      tap((res) => {
        if (res.data) this.applyLoginResponse(res.data);
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

  clearMustChangePassword(): void {
    const user = this.getCurrentUser();
    if (user) this.tokenStorage.setUser({ ...user, mustChangePassword: false });
  }

  applyLoginResponse(data: LoginResponse): void {
    if (data.accessToken) this.tokenStorage.setToken(data.accessToken);
    if (data.refreshToken) this.tokenStorage.setRefreshToken(data.refreshToken);
    const userDto = data.user;
    if (!userDto) return;
    const extraRoles = Array.isArray(userDto.extraRoles) ? (userDto.extraRoles as UserRole[]) : [];
    const current = this.getCurrentUser();
    const user: CurrentUser = {
      id: userDto.id, username: userDto.username, email: userDto.email, fullName: userDto.fullName,
      fullNameAr: userDto.fullNameAr, fullNameEn: userDto.fullNameEn, profileImageUrl: userDto.profileImageUrl,
      role: userDto.role, activeRole: current?.activeRole ?? userDto.role, extraRoles, doctorId: userDto.doctorId,
      permissions: userDto.permissions, initials: this.buildInitials(userDto.fullNameAr || userDto.fullNameEn || userDto.fullName),
      mustChangePassword: userDto.mustChangePassword ?? false
    };
    this.tokenStorage.setUser(user);
  }

  clearExpiredTokens(): void {
    const token = this.tokenStorage.getToken();
    if (token && JwtUtils.isExpired(token)) this.tokenStorage.clearAll();
  }

  getDashboardRoute(): string {
    const role = this.getRole();
    switch (role) {
      case 'RECEPTIONIST': return '/admin/reception';
      case 'DOCTOR': return '/admin/consultation';
      case 'NURSE': return '/admin/queue';
      case 'CASHIER': return '/admin/billing';
      case 'LAB_TECHNICIAN': return '/admin/lab';
      case 'RADIOLOGY_STAFF': return '/admin/radiology';
      default: return '/admin/dashboard';
    }
  }

  private buildInitials(name: string): string {
    const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'U';
    return words.slice(0, 2).map((x) => x[0]?.toUpperCase() ?? '').join('');
  }
}
