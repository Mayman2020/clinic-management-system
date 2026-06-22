import { Injectable } from '@angular/core';
import { AppConstants } from '../constants/app-constants';

@Injectable({ providedIn: 'root' })
export class QueueRealtimeService {
  connect(path: string, onRefresh: () => void, withAuth = false): () => void {
    let url = `${AppConstants.API.baseURL}${path}`;
    if (withAuth) {
      const token = localStorage.getItem(AppConstants.PERSISTED_KEYS.ACCESS_TOKEN);
      if (token) url += `?access_token=${encodeURIComponent(token)}`;
    }
    const source = new EventSource(url);
    source.addEventListener('refresh', () => onRefresh());
    source.onerror = () => { /* components keep fallback polling */ };
    return () => source.close();
  }

  connectDashboard(onRefresh: () => void): () => void {
    return this.connect(AppConstants.API.QUEUE_STREAM, onRefresh, true);
  }

  connectTv(onRefresh: () => void): () => void {
    return this.connect(AppConstants.API.QUEUE_TV_STREAM, onRefresh, false);
  }
}
