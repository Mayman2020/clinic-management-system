import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { PermissionMap, UserRole } from '../models/user.model';

export interface RolePermissionDto {
  role: UserRole;
  permissions: PermissionMap;
}

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<ApiResponse<RolePermissionDto[]>> {
    return this.api.get<ApiResponse<RolePermissionDto[]>>(AppConstants.API.ROLE_PERMISSIONS);
  }

  getByRole(role: UserRole): Observable<ApiResponse<RolePermissionDto>> {
    return this.api.get<ApiResponse<RolePermissionDto>>(AppConstants.API.ROLE_PERMISSIONS_BY_ROLE(role));
  }

  update(role: UserRole, permissions: PermissionMap): Observable<ApiResponse<RolePermissionDto>> {
    return this.api.put<ApiResponse<RolePermissionDto>>(AppConstants.API.ROLE_PERMISSIONS_BY_ROLE(role), { permissions });
  }
}
