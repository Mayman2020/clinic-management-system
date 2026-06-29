import { Injectable } from '@angular/core';
import { Observable, of, tap, catchError } from 'rxjs';
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
      }),
      catchError(() => of(null))
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
