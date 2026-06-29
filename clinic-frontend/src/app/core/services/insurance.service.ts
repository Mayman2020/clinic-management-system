import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { InsuranceClaim, InsuranceProvider } from '../models/insurance.model';

@Injectable({ providedIn: 'root' })
export class InsuranceService {
  constructor(private readonly api: ApiService) {}
  listProviders(): Observable<ApiResponse<InsuranceProvider[]>> {
    return this.api.get<ApiResponse<InsuranceProvider[]>>(AppConstants.API.INSURANCE_PROVIDERS);
  }
  createProvider(payload: Partial<InsuranceProvider>): Observable<ApiResponse<InsuranceProvider>> {
    return this.api.post<ApiResponse<InsuranceProvider>>(AppConstants.API.INSURANCE_PROVIDERS, payload);
  }
  updateProvider(id: number, payload: Partial<InsuranceProvider>): Observable<ApiResponse<InsuranceProvider>> {
    return this.api.put<ApiResponse<InsuranceProvider>>(AppConstants.API.INSURANCE_PROVIDER_BY_ID(id), payload);
  }
  deactivateProvider(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(AppConstants.API.INSURANCE_PROVIDER_BY_ID(id));
  }
  listClaims(page = 0, size = 20, params: Record<string, string | number> = {}): Observable<ApiResponse<PagedResponse<InsuranceClaim>>> {
    return this.api.get<ApiResponse<PagedResponse<InsuranceClaim>>>(AppConstants.API.INSURANCE_CLAIMS, { page, size, ...params });
  }
  createClaim(payload: Partial<InsuranceClaim>): Observable<ApiResponse<InsuranceClaim>> {
    return this.api.post<ApiResponse<InsuranceClaim>>(AppConstants.API.INSURANCE_CLAIMS, payload);
  }
  updateClaimStatus(id: number, status: string): Observable<ApiResponse<InsuranceClaim>> {
    return this.api.patch<ApiResponse<InsuranceClaim>>(AppConstants.API.INSURANCE_CLAIM_STATUS(id), undefined, { status });
  }
}
