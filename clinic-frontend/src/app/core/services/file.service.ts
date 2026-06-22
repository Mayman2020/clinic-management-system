import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private readonly api: ApiService) {}

  upload(file: File): Observable<string> {
    return this.api.uploadFile(file).pipe(map((r) => r.url));
  }

  buildUrl(filename: string): string {
    return `${AppConstants.API.baseURL}/files/${filename}`;
  }
}
