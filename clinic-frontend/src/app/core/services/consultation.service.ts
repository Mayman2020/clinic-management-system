import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Consultation } from '../models/consultation.model';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, search = ''): Observable<ApiResponse<PagedResponse<Consultation>>> {
    const params: Record<string, string | number> = { page, size };
    if (search) params['q'] = search;
    return this.api.get<ApiResponse<PagedResponse<Consultation>>>(AppConstants.API.CONSULTATIONS, params);
  }
  getById(id: number): Observable<ApiResponse<Consultation>> {
    return this.api.get<ApiResponse<Consultation>>(AppConstants.API.CONSULTATION_BY_ID(id));
  }
  create(payload: Partial<Consultation>): Observable<ApiResponse<Consultation>> {
    return this.api.post<ApiResponse<Consultation>>(AppConstants.API.CONSULTATIONS, payload);
  }
  update(id: number, payload: Partial<Consultation>): Observable<ApiResponse<Consultation>> {
    return this.api.put<ApiResponse<Consultation>>(AppConstants.API.CONSULTATION_BY_ID(id), payload);
  }
  getByPatient(patientId: number): Observable<ApiResponse<Consultation[]>> {
    return this.api.get<ApiResponse<Consultation[]>>(AppConstants.API.CONSULTATIONS_BY_PATIENT(patientId));
  }
  complete(id: number): Observable<ApiResponse<Consultation>> {
    return this.api.post<ApiResponse<Consultation>>(AppConstants.API.CONSULTATION_COMPLETE(id), {});
  }
  generateInvoice(id: number): Observable<ApiResponse<unknown>> {
    return this.api.post<ApiResponse<unknown>>(AppConstants.API.CONSULTATION_GENERATE_INVOICE(id), {});
  }
}
