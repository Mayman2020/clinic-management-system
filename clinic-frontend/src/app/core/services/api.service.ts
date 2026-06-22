import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AppConstants } from '../constants/app-constants';
import { normalizeFileUrl, normalizeFileUrlsInValue } from '../utils/file-url-utils';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = this.resolveApiBase();
  constructor(private readonly http: HttpClient) {}
  private resolveApiBase(): string {
    const runtimeApi = (window as Window & { __CM_API_URL__?: string }).__CM_API_URL__;
    return (runtimeApi && runtimeApi.trim()) ? runtimeApi : AppConstants.API.baseURL;
  }
  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) httpParams = httpParams.set(k, String(v)); });
    return this.normalizeResponse(this.http.get<T>(`${this.base}${path}`, { params: httpParams }));
  }
  post<T>(path: string, body: unknown): Observable<T> { return this.normalizeResponse(this.http.post<T>(`${this.base}${path}`, body)); }
  put<T>(path: string, body: unknown): Observable<T> { return this.normalizeResponse(this.http.put<T>(`${this.base}${path}`, body)); }
  patch<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) httpParams = httpParams.set(k, String(v)); });
    return this.normalizeResponse(this.http.patch<T>(`${this.base}${path}`, body ?? null, { params: httpParams }));
  }
  delete<T>(path: string): Observable<T> { return this.normalizeResponse(this.http.delete<T>(`${this.base}${path}`)); }
  buildUrl(path: string): string { return `${this.base}${path}`; }
  uploadFile(file: File): Observable<{ url: string; filename?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; data?: { url?: string; filename?: string } }>(`${this.base}${AppConstants.API.FILES_UPLOAD}`, formData)
      .pipe(timeout(180_000), map((res) => ({ url: res?.data?.url ? normalizeFileUrl(res.data.url) : '', filename: res?.data?.filename })));
  }
  private normalizeResponse<T>(response: Observable<T>): Observable<T> {
    return response.pipe(map((value) => normalizeFileUrlsInValue(value)));
  }
}
