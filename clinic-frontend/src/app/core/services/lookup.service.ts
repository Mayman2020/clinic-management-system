import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';

export type LookupType =
  | 'SPECIALTY'
  | 'DEPARTMENT'
  | 'LAB_TEST_TYPE'
  | 'LAB_TEST_CATEGORY'
  | 'RADIOLOGY_STUDY_TYPE'
  | 'PAYMENT_METHOD';

export interface LookupItem {
  id: number;
  type: LookupType;
  code: string;
  nameAr: string;
  nameEn: string;
  parentId?: number;
  sortOrder: number;
  active: boolean;
  locked: boolean;
}

export interface CreateLookupRequest {
  type: LookupType;
  code?: string;
  nameAr: string;
  nameEn: string;
  sortOrder?: number;
}

export interface UpdateLookupRequest {
  code: string;
  nameAr: string;
  nameEn: string;
  sortOrder?: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class LookupService {
  constructor(private readonly api: ApiService) {}

  getByType(type: LookupType): Observable<ApiResponse<LookupItem[]>> {
    return this.api.get(AppConstants.API.LOOKUPS_BY_TYPE, { type });
  }

  getAllByType(type: LookupType): Observable<ApiResponse<LookupItem[]>> {
    return this.api.get(AppConstants.API.LOOKUPS_ADMIN_BY_TYPE, { type });
  }

  create(request: CreateLookupRequest): Observable<ApiResponse<LookupItem>> {
    return this.api.post(AppConstants.API.LOOKUPS, request);
  }

  update(id: number, request: UpdateLookupRequest): Observable<ApiResponse<LookupItem>> {
    return this.api.put(AppConstants.API.LOOKUP_BY_ID(id), request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete(AppConstants.API.LOOKUP_BY_ID(id));
  }
}
