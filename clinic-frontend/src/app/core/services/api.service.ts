import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
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
  get<T>(path: string, params?: Record<string, string | number | boolean | readonly (string | number)[]>): Observable<T> {
    return this.normalizeResponse(this.http.get<T>(`${this.base}${path}`, { params: this.buildParams(params) }));
  }
  post<T>(path: string, body: unknown): Observable<T> { return this.normalizeResponse(this.http.post<T>(`${this.base}${path}`, body)); }
  put<T>(path: string, body: unknown, params?: Record<string, string | number | boolean | readonly (string | number)[]>): Observable<T> {
    return this.normalizeResponse(this.http.put<T>(`${this.base}${path}`, body, { params: this.buildParams(params) }));
  }
  patch<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | readonly (string | number)[]>): Observable<T> {
    return this.normalizeResponse(this.http.patch<T>(`${this.base}${path}`, body ?? null, { params: this.buildParams(params) }));
  }
  delete<T>(path: string): Observable<T> { return this.normalizeResponse(this.http.delete<T>(`${this.base}${path}`)); }
  getBlob(path: string): Observable<Blob> {
    return this.http.get(`${this.base}${path}`, { responseType: 'blob' });
  }
  buildUrl(path: string): string { return `${this.base}${path}`; }
  uploadFile(file: File): Observable<{ url: string; filename?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; data?: { url?: string; filename?: string } }>(`${this.base}${AppConstants.API.FILES_UPLOAD}`, formData)
      .pipe(timeout(180_000), map((res) => ({ url: res?.data?.url ? normalizeFileUrl(res.data.url) : '', filename: res?.data?.filename })));
  }
  private buildParams(params?: Record<string, string | number | boolean | readonly (string | number)[]>): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => { if (item != null) httpParams = httpParams.append(key, String(item)); });
        return;
      }
      httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }
  private normalizeResponse<T>(response: Observable<T>): Observable<T> {
    return response.pipe(
      map((value) => normalizeFileUrlsInValue(value)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          return throwError(() => new Error('Unable to reach the clinic backend. Please check that the server is running.'));
        }
        return throwError(() => error);
      })
    );
  }
}
