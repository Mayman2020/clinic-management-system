import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Appointment } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, params: Record<string, string | number | readonly string[]> = {}): Observable<ApiResponse<PagedResponse<Appointment>>> {
    return this.api.get<ApiResponse<PagedResponse<Appointment>>>(AppConstants.API.APPOINTMENTS, { page, size, ...params });
  }
  getCalendar(from: string, to: string): Observable<ApiResponse<Appointment[]>> {
    return this.api.get<ApiResponse<Appointment[]>>(AppConstants.API.APPOINTMENTS_CALENDAR, { from, to });
  }
  book(payload: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.api.post<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENTS_BOOK, payload);
  }
  walkIn(payload: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.api.post<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENTS_WALK_IN, payload);
  }
  cancel(id: number): Observable<ApiResponse<Appointment>> {
    return this.api.post<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENT_CANCEL(id), {});
  }
  confirm(id: number): Observable<ApiResponse<Appointment>> {
    return this.api.post<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENT_CONFIRM(id), {});
  }
  reschedule(id: number, payload: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.api.put<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENT_RESCHEDULE(id), payload);
  }
  updateStatus(id: number, status: string): Observable<ApiResponse<Appointment>> {
    return this.api.patch<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENT_STATUS(id), undefined, { status });
  }
    getByPatient(patientId: number): Observable<ApiResponse<Appointment[]>> {
    return this.api.get<ApiResponse<Appointment[]>>(AppConstants.API.APPOINTMENTS_BY_PATIENT(patientId));
  }
  getById(id: number): Observable<ApiResponse<Appointment>> {
    return this.api.get<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENT_BY_ID(id));
  }
  checkIn(id: number): Observable<ApiResponse<{ appointment: Appointment; queueToken: unknown }>> {
    return this.api.post<ApiResponse<{ appointment: Appointment; queueToken: unknown }>>(AppConstants.API.APPOINTMENT_CHECK_IN(id), {});
  }
  sendReminder(id: number): Observable<ApiResponse<{ appointmentId: number; staffNotified: boolean; emailSent: boolean; smsSent: boolean; message: string }>> {
    return this.api.post<ApiResponse<{ appointmentId: number; staffNotified: boolean; emailSent: boolean; smsSent: boolean; message: string }>>(AppConstants.API.APPOINTMENT_SEND_REMINDER(id), {});
  }
}
