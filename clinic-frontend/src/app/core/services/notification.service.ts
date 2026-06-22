import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { NotificationItem } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20): Observable<ApiResponse<PagedResponse<NotificationItem>>> {
    return this.api.get<ApiResponse<PagedResponse<NotificationItem>>>(AppConstants.API.NOTIFICATIONS_MY, { page, size });
  }

  unreadCount(): Observable<ApiResponse<{ unreadCount: number }>> {
    return this.api.get<ApiResponse<{ unreadCount: number }>>(AppConstants.API.NOTIFICATIONS_UNREAD_COUNT);
  }

  markRead(id: number): Observable<ApiResponse<NotificationItem>> {
    return this.api.patch<ApiResponse<NotificationItem>>(AppConstants.API.NOTIFICATION_MARK_READ(id));
  }

  markAllRead(): Observable<ApiResponse<void>> {
    return this.api.patch<ApiResponse<void>>(AppConstants.API.NOTIFICATIONS_READ_ALL);
  }
}
