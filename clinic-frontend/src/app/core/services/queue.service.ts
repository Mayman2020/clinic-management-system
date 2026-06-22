import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { QueueToken } from '../models/queue.model';

@Injectable({ providedIn: 'root' })
export class QueueService {
  constructor(private readonly api: ApiService) {}

  getToday(doctorId?: number): Observable<ApiResponse<QueueToken[]>> {
    return this.api.get<ApiResponse<QueueToken[]>>(AppConstants.API.QUEUE_TODAY, doctorId ? { doctorId } : undefined);
  }

  callNext(doctorId?: number): Observable<ApiResponse<QueueToken>> {
    return this.api.post<ApiResponse<QueueToken>>(AppConstants.API.QUEUE_CALL_NEXT, doctorId ? { doctorId } : {});
  }

  generateToken(payload: { patientId: number; doctorId?: number; queueDate: string; appointmentId?: number }): Observable<ApiResponse<QueueToken>> {
    return this.api.post<ApiResponse<QueueToken>>(AppConstants.API.QUEUE_TOKENS, payload);
  }

  updateStatus(id: number, status: string): Observable<ApiResponse<QueueToken>> {
    return this.api.patch<ApiResponse<QueueToken>>(AppConstants.API.QUEUE_TOKEN_STATUS(id), undefined, { status });
  }

  getTvDisplay(): Observable<ApiResponse<QueueToken[]>> {
    return this.api.get<ApiResponse<QueueToken[]>>(AppConstants.API.QUEUE_TV_DISPLAY);
  }
}
