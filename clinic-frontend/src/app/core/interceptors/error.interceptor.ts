import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { AppConstants } from '../constants/app-constants';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);
  const auth = inject(AuthService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes(AppConstants.API.AUTH_LOGIN)) {
        tokenStorage.clearAll();
        auth.storeReturnUrl(req.url.includes('http') ? new URL(req.url).pathname : req.url);
        void router.navigateByUrl('/auth/login');
      }

      const { errorCode, message: rawMsg } = readApiErrorBody(err);
      const message = translateBackendError(errorCode, rawMsg, err.status, translate);
      const normalizedError = new Error(message) as Error & { status?: number; errorCode?: string };
      normalizedError.status = err.status;
      normalizedError.errorCode = errorCode;
      return throwError(() => normalizedError);
    })
  );
};

function readApiErrorBody(err: HttpErrorResponse): { errorCode?: string; message: string } {
  const body = err.error;
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const o = body as Record<string, unknown>;
    const code = (o['errorCode'] ?? o['error_code']) as string | undefined;
    const message = (o['message'] as string | undefined) ?? err.message ?? '';
    return { errorCode: typeof code === 'string' ? code : undefined, message };
  }
  if (typeof body === 'string' && body.trim()) {
    return { errorCode: undefined, message: body };
  }
  return { errorCode: undefined, message: err.message ?? '' };
}

function translateBackendError(
  errorCode: string | undefined,
  rawMsg: string,
  status: number,
  translate: TranslateService
): string {
  const rawKey = (rawMsg ?? '').trim();
  if (rawKey && /^[A-Z0-9_.-]+$/.test(rawKey)) {
    const fromKey = translate.instant(rawKey);
    if (fromKey && fromKey !== rawKey) return fromKey;
  }

  if (rawMsg && !/^[A-Z0-9_.-]+$/.test(rawMsg.trim()) && !looksLikeEnglishTechnical(rawMsg)) {
    return rawMsg;
  }

  const codeKey = errorCode ? `ERRORS.${errorCode}` : '';
  if (codeKey) {
    const fromCode = translate.instant(codeKey);
    if (fromCode && fromCode !== codeKey) return fromCode;
  }

  switch (errorCode) {
    case 'INVALID_PARAMETER':
      return translate.instant('ERRORS.INVALID_PARAMETER');
    case 'MISSING_PARAMETER':
      return translate.instant('ERRORS.MISSING_PARAMETER');
    case 'INVALID_REQUEST_BODY':
      return translate.instant('ERRORS.INVALID_REQUEST_BODY');
    case 'INVALID_DATE_FORMAT':
      return translate.instant('ERRORS.INVALID_DATE_FORMAT');
    case 'UNAUTHORIZED':
      return translate.instant('ERRORS.UNAUTHORIZED');
    case 'FORBIDDEN':
      return translate.instant('ERRORS.FORBIDDEN');
    case 'NOT_FOUND':
      return translate.instant('ERRORS.NOT_FOUND');
    case 'INTERNAL_ERROR':
      return translate.instant('ERRORS.INTERNAL');
    case 'VALIDATION_ERROR':
      return translate.instant('ERRORS.VALIDATION');
    case 'NATIONAL_ID_ALREADY_USED':
      return translate.instant('ERRORS.NATIONAL_ID_ALREADY_USED');
    case 'EMAIL_ALREADY_USED':
      return translate.instant('ERRORS.EMAIL_ALREADY_USED');
    default:
      break;
  }

  switch (status) {
    case 0:
      return translate.instant('ERRORS.NETWORK');
    case 401:
      return translate.instant('ERRORS.UNAUTHORIZED');
    case 403:
      return translate.instant('ERRORS.FORBIDDEN');
    case 404:
      return translate.instant('ERRORS.NOT_FOUND');
    case 400:
      return translate.instant('ERRORS.INVALID_PARAMETER');
    case 500:
    case 502:
    case 504:
      return translate.instant('ERRORS.INTERNAL');
    default:
      return translate.instant('ERRORS.GENERIC');
  }
}

function looksLikeEnglishTechnical(msg: string): boolean {
  const trimmed = msg.trim();
  if (!trimmed) return false;
  return /^Http failure response|^Cannot reach backend|^Unknown Error/i.test(trimmed);
}
