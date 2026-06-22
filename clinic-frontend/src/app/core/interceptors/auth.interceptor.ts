import { HttpInterceptorFn } from '@angular/common/http';
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
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (activeRole) headers[HTTP_HEADERS.ACTIVE_ROLE] = activeRole;
  return Object.keys(headers).length ? next(req.clone({ setHeaders: headers })) : next(req);
};
