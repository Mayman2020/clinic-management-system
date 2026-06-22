import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { AuditLog } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20): Observable<ApiResponse<PagedResponse<AuditLog>>> {
    return this.api.get<ApiResponse<PagedResponse<AuditLog>>>(AppConstants.API.AUDIT_LOGS, { page, size });
  }
}
