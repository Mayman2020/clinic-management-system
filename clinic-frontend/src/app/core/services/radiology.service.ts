import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { RadiologyRequest } from '../models/radiology.model';

@Injectable({ providedIn: 'root' })
export class RadiologyService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20): Observable<ApiResponse<PagedResponse<RadiologyRequest>>> {
    return this.api.get<ApiResponse<PagedResponse<RadiologyRequest>>>(AppConstants.API.RADIOLOGY_REQUESTS, { page, size });
  }
  create(payload: Partial<RadiologyRequest>): Observable<ApiResponse<RadiologyRequest>> {
    return this.api.post<ApiResponse<RadiologyRequest>>(AppConstants.API.RADIOLOGY, payload);
  }
  updateStatus(id: number, status: string): Observable<ApiResponse<RadiologyRequest>> {
    return this.api.patch<ApiResponse<RadiologyRequest>>(AppConstants.API.RADIOLOGY_REQUEST_STATUS(id), undefined, { status });
  }
}
