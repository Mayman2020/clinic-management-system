import { Injectable } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

@Injectable({ providedIn: 'root' })
export class PrintService {
  constructor(private readonly i18n: I18nService) {}

  private t(key: string): string { return this.i18n.instant(key); }

  openHtml(title: string, bodyHtml: string): void {
    const rtl = this.i18n.currentLang === 'ar';
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: ${rtl ? 'Tahoma, Arial' : 'Arial'}, sans-serif; margin: 24px; color: #1b3553; }
  h1 { margin: 0 0 8px; font-size: 22px; }
  .meta { color: #666; margin-bottom: 16px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: start; font-size: 13px; }
  th { background: #f5f5f5; }
  .totals { margin-top: 16px; text-align: end; }
  @media print { body { margin: 12px; } }
</style></head><body>${bodyHtml}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  }

  prescription(data: {
    prescriptionNo: string; patientName?: string; doctorName?: string; patientId?: number; doctorId?: number;
    notes?: string; issuedAt?: string; clinicName?: string;
    items?: { medicineName: string; dosage?: string; frequency?: string; duration?: string; notes?: string }[];
  }): void {
    const rows = (data.items ?? []).map(i =>
      `<tr><td>${i.medicineName}</td><td>${i.dosage ?? ''}</td><td>${i.frequency ?? ''}</td><td>${i.duration ?? ''}</td><td>${i.notes ?? ''}</td></tr>`
    ).join('');
    const patient = data.patientName || `#${data.patientId ?? ''}`;
    const doctor = data.doctorName || `#${data.doctorId ?? ''}`;
    this.openHtml(data.prescriptionNo, `
      <h1>${data.clinicName ?? this.t('PRINT.CLINIC')}</h1>
      <div class="meta">${data.prescriptionNo} · ${data.issuedAt ?? ''}</div>
      <div class="meta">${this.t('PRINT.PATIENT')}: ${patient} · ${this.t('PRINT.DOCTOR')}: ${doctor}</div>
      ${data.notes ? `<p>${data.notes}</p>` : ''}
      <table><thead><tr><th>${this.t('PRINT.MEDICINE')}</th><th>${this.t('PRINT.DOSAGE')}</th><th>${this.t('PRINT.FREQUENCY')}</th><th>${this.t('PRINT.DURATION')}</th><th>${this.t('PRINT.NOTES')}</th></tr></thead><tbody>${rows}</tbody></table>
    `);
  }

  invoice(data: {
    invoiceNo: string; patientName?: string; status?: string; createdAt?: string; clinicName?: string;
    subtotal?: number; discount?: number; tax?: number; total?: number; paidAmount?: number;
    items?: { description?: string; quantity?: number; unitPrice?: number; totalPrice?: number }[];
  }): void {
    const rows = (data.items ?? []).map(i =>
      `<tr><td>${i.description ?? ''}</td><td>${i.quantity ?? 1}</td><td>${i.unitPrice ?? ''}</td><td>${i.totalPrice ?? ''}</td></tr>`
    ).join('');
    this.openHtml(data.invoiceNo, `
      <h1>${data.clinicName ?? this.t('PRINT.CLINIC')}</h1>
      <div class="meta">${data.invoiceNo} · ${data.createdAt ?? ''} · ${data.status ?? ''}</div>
      <div class="meta">${data.patientName ?? ''}</div>
      <table><thead><tr><th>${this.t('PRINT.DESCRIPTION')}</th><th>${this.t('PRINT.QTY')}</th><th>${this.t('PRINT.UNIT')}</th><th>${this.t('PRINT.TOTAL')}</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals">
        <div>${this.t('BILLING.SUBTOTAL')}: ${data.subtotal ?? 0}</div>
        <div>${this.t('BILLING.DISCOUNT')}: ${data.discount ?? 0}</div>
        <div>${this.t('BILLING.TAX')}: ${data.tax ?? 0}</div>
        <div><strong>${this.t('BILLING.TOTAL')}: ${data.total ?? 0}</strong></div>
        <div>${this.t('BILLING.PAID')}: ${data.paidAmount ?? 0}</div>
      </div>
    `);
  }
}
