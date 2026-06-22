import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { ClinicSetting } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<ApiResponse<ClinicSetting[]>> {
    return this.api.get<ApiResponse<ClinicSetting[]>>(AppConstants.API.SETTINGS);
  }

  upsert(key: string, value: string): Observable<ApiResponse<ClinicSetting>> {
    return this.api.put<ApiResponse<ClinicSetting>>(AppConstants.API.SETTINGS, { settingKey: key, settingValue: value });
  }
}
