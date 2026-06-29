import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, q = '', role = ''): Observable<ApiResponse<PagedResponse<User>>> {
    const params: Record<string, string | number> = { page, size };
    if (q) params['q'] = q;
    if (role) params['role'] = role;
    return this.api.get<ApiResponse<PagedResponse<User>>>(AppConstants.API.USERS, params);
  }
  getById(id: number): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(AppConstants.API.USER_BY_ID(id));
  }
  create(payload: Partial<User> & { password?: string }): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>(AppConstants.API.USERS, payload);
  }
  update(id: number, payload: Partial<User> & { password?: string }): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>(AppConstants.API.USER_BY_ID(id), payload);
  }
  toggleActive(id: number): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>(AppConstants.API.USERS_TOGGLE_ACTIVE(id), {});
  }
}
