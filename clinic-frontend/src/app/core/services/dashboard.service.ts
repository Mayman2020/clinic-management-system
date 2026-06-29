import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { ChartPoint, DashboardStats } from '../models/dashboard.model';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}
  getStats(branchId?: number): Observable<ApiResponse<DashboardStats>> {
    const params = branchId != null ? { branchId } : undefined;
    return this.api.get<ApiResponse<DashboardStats>>(AppConstants.API.DASHBOARD_STATS, params);
  }
  getRevenueChart(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.DASHBOARD_REVENUE); }
  getAppointmentsChart(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.DASHBOARD_APPOINTMENTS); }
}
