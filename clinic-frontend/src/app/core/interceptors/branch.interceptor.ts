import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BranchService } from '../services/branch.service';
import { HTTP_HEADERS } from '../constants/app-constants';

export const branchInterceptor: HttpInterceptorFn = (req, next) => {
  const branch = inject(BranchService);
  if (!branch.multiBranchEnabled || !branch.currentBranchId) return next(req);
  return next(req.clone({ setHeaders: { [HTTP_HEADERS.BRANCH_ID]: String(branch.currentBranchId) } }));
};
