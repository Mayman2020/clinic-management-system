import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Prescription } from '../models/prescription.model';
@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, params: Record<string, string | number> = {}): Observable<ApiResponse<PagedResponse<Prescription>>> {
    return this.api.get<ApiResponse<PagedResponse<Prescription>>>(AppConstants.API.PRESCRIPTIONS, { page, size, ...params });
  }
  listByPatient(patientId: number): Observable<ApiResponse<Prescription[]>> {
    return this.api.get<ApiResponse<Prescription[]>>(`${AppConstants.API.PRESCRIPTIONS}/patient/${patientId}`);
  }
  create(payload: Partial<Prescription>): Observable<ApiResponse<Prescription>> { return this.api.post<ApiResponse<Prescription>>(AppConstants.API.PRESCRIPTIONS, payload); }
  getPrint(id: number): Observable<ApiResponse<Prescription>> { return this.api.get<ApiResponse<Prescription>>(AppConstants.API.PRESCRIPTION_PRINT(id)); }
  downloadPdf(id: number): Observable<Blob> { return this.api.getBlob(AppConstants.API.PRESCRIPTION_PDF(id)); }
}
