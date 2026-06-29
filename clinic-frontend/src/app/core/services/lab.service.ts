import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { LabRequest } from '../models/lab.model';

@Injectable({ providedIn: 'root' })
export class LabService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, params: Record<string, string | number> = {}): Observable<ApiResponse<PagedResponse<LabRequest>>> {
    return this.api.get<ApiResponse<PagedResponse<LabRequest>>>(AppConstants.API.LAB_REQUESTS, { page, size, ...params });
  }
  create(payload: Partial<LabRequest>): Observable<ApiResponse<LabRequest>> {
    return this.api.post<ApiResponse<LabRequest>>(AppConstants.API.LAB, payload);
  }
  updateStatus(id: number, status: string, resultPdfUrl?: string): Observable<ApiResponse<LabRequest>> {
    const params: Record<string, string> = { status };
    if (resultPdfUrl) params['resultPdfUrl'] = resultPdfUrl;
    return this.api.patch<ApiResponse<LabRequest>>(AppConstants.API.LAB_REQUEST_STATUS(id), undefined, params);
  }
  getByPatient(patientId: number): Observable<ApiResponse<LabRequest[]>> {
    return this.api.get<ApiResponse<LabRequest[]>>(AppConstants.API.LAB_BY_PATIENT(patientId));
  }
}
