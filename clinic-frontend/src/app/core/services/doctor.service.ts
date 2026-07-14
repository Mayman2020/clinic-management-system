import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Doctor, DoctorSchedule } from '../models/doctor.model';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, search = '', params: Record<string, string | number | boolean> = {}): Observable<ApiResponse<PagedResponse<Doctor>>> {
    const query: Record<string, string | number | boolean> = { page, size, ...params };
    if (search) query['q'] = search;
    return this.api.get<ApiResponse<PagedResponse<Doctor>>>(AppConstants.API.DOCTORS, query);
  }
  listActive(): Observable<ApiResponse<Doctor[]>> {
    return this.api.get<ApiResponse<Doctor[]>>(AppConstants.API.DOCTORS_ACTIVE);
  }
  getById(id: number): Observable<ApiResponse<Doctor>> {
    return this.api.get<ApiResponse<Doctor>>(AppConstants.API.DOCTOR_BY_ID(id));
  }
  create(payload: Partial<Doctor>): Observable<ApiResponse<Doctor>> {
    return this.api.post<ApiResponse<Doctor>>(AppConstants.API.DOCTORS, payload);
  }
  update(id: number, payload: Partial<Doctor>): Observable<ApiResponse<Doctor>> {
    return this.api.put<ApiResponse<Doctor>>(AppConstants.API.DOCTOR_BY_ID(id), payload);
  }
  getSchedules(doctorId: number): Observable<ApiResponse<DoctorSchedule[]>> {
    return this.api.get<ApiResponse<DoctorSchedule[]>>(AppConstants.API.DOCTOR_SCHEDULES(doctorId));
  }
  saveSchedule(doctorId: number, payload: Partial<DoctorSchedule>): Observable<ApiResponse<DoctorSchedule>> {
    return this.api.post<ApiResponse<DoctorSchedule>>(AppConstants.API.DOCTOR_SCHEDULES(doctorId), payload);
  }
}
