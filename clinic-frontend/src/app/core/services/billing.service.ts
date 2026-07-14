import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Invoice, Payment } from '../models/billing.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  constructor(private readonly api: ApiService) {}
  listInvoices(page = 0, size = 20, params: Record<string, string | number> = {}): Observable<ApiResponse<PagedResponse<Invoice>>> {
    return this.api.get<ApiResponse<PagedResponse<Invoice>>>(AppConstants.API.INVOICES, { page, size, ...params });
  }
  getByPatient(patientId: number, page = 0, size = 50): Observable<ApiResponse<PagedResponse<Invoice>>> {
    return this.api.get<ApiResponse<PagedResponse<Invoice>>>(AppConstants.API.INVOICES_BY_PATIENT(patientId), { page, size });
  }
  listPayments(page = 0, size = 20, params: Record<string, string | number> = {}): Observable<ApiResponse<PagedResponse<Payment>>> {
    return this.api.get<ApiResponse<PagedResponse<Payment>>>(AppConstants.API.PAYMENTS, { page, size, ...params });
  }
  getById(id: number): Observable<ApiResponse<Invoice>> {
    return this.api.get<ApiResponse<Invoice>>(AppConstants.API.INVOICE_BY_ID(id));
  }
  createInvoice(payload: Record<string, unknown>): Observable<ApiResponse<Invoice>> {
    return this.api.post<ApiResponse<Invoice>>(AppConstants.API.INVOICES, payload);
  }
  mixedPayment(invoiceId: number, payload: Record<string, unknown>): Observable<ApiResponse<Invoice>> {
    return this.api.post<ApiResponse<Invoice>>(AppConstants.API.INVOICE_MIXED_PAYMENT(invoiceId), payload);
  }
  getPrint(id: number): Observable<ApiResponse<Record<string, unknown>>> {
    return this.api.get<ApiResponse<Record<string, unknown>>>(AppConstants.API.INVOICE_PRINT(id));
  }
  downloadPdf(id: number): Observable<Blob> {
    return this.api.getBlob(AppConstants.API.INVOICE_PDF(id));
  }
  recordPayment(invoiceId: number, payload: Partial<Payment>): Observable<ApiResponse<Invoice>> {
    return this.mixedPayment(invoiceId, { payments: [payload] });
  }

  getPaymentsByInvoice(invoiceId: number): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>(AppConstants.API.PAYMENTS_BY_INVOICE(invoiceId));
  }
}
