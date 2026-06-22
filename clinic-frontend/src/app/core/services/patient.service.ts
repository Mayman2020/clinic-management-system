import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Patient } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, q = ''): Observable<ApiResponse<PagedResponse<Patient>>> {
    const params: Record<string, string | number> = { page, size };
    if (q) params['q'] = q;
    return this.api.get<ApiResponse<PagedResponse<Patient>>>(AppConstants.API.PATIENTS, params);
  }
  getById(id: number): Observable<ApiResponse<Patient>> {
    return this.api.get<ApiResponse<Patient>>(AppConstants.API.PATIENT_BY_ID(id));
  }
  create(payload: Partial<Patient>): Observable<ApiResponse<Patient>> {
    return this.api.post<ApiResponse<Patient>>(AppConstants.API.PATIENTS, payload);
  }
  update(id: number, payload: Partial<Patient>): Observable<ApiResponse<Patient>> {
    return this.api.put<ApiResponse<Patient>>(AppConstants.API.PATIENT_BY_ID(id), payload);
  }
  archive(id: number): Observable<ApiResponse<void>> {
    return this.api.post<ApiResponse<void>>(AppConstants.API.PATIENT_ARCHIVE(id), {});
  }
  addDocument(patientId: number, payload: { fileName: string; fileUrl: string; documentType: string }): Observable<ApiResponse<unknown>> {
    return this.api.post<ApiResponse<unknown>>(AppConstants.API.PATIENT_DOCUMENTS_UPLOAD, { patientId, ...payload });
  }
  getDocuments(patientId: number): Observable<ApiResponse<{ id: number; fileName: string; fileUrl: string; documentType: string }[]>> {
    return this.api.get<ApiResponse<{ id: number; fileName: string; fileUrl: string; documentType: string }[]>>(AppConstants.API.PATIENT_DOCUMENTS(patientId));
  }
  search(q: string): Observable<ApiResponse<PagedResponse<Patient>>> {
    return this.api.get<ApiResponse<PagedResponse<Patient>>>(AppConstants.API.PATIENTS, { page: 0, size: 20, q });
  }
}
