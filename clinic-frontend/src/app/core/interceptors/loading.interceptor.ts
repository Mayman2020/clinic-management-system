import { HttpInterceptorFn } from '@angular/common/http';
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
