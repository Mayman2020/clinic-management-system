import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
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
