import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { LoginResponse } from '../models/user.model';
import { User } from '../models/user.model';

export interface UserProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private readonly api: ApiService) {}

  getMyProfile(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(AppConstants.API.USERS_ME);
  }

  updateMyProfile(payload: UserProfileUpdateRequest): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>(AppConstants.API.USERS_ME, payload);
  }

  changeMyPassword(payload: ChangePasswordRequest): Observable<ApiResponse<LoginResponse>> {
    return this.api.post<ApiResponse<LoginResponse>>(AppConstants.API.USERS_ME_CHANGE_PASSWORD, payload);
  }
}
