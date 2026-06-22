import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { ChartPoint } from '../models/dashboard.model';
@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private readonly api: ApiService) {}
  appointments(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_APPOINTMENTS); }
  revenue(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_REVENUE); }
  patients(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_PATIENTS); }
  doctors(from?: string, to?: string): Observable<ApiResponse<ChartPoint[]>> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_DOCTORS, Object.keys(params).length ? params : undefined);
  }
}
