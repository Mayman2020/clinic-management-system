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
    invoiceNo?: string; patientName?: string; status?: string; createdAt?: string; clinicName?: string;
    clinicPhone?: string; clinicAddress?: string; consultationTitle?: string; doctorName?: string;
    doctorSpecialty?: string; patientPhone?: string; patientDob?: string; patientAge?: string;
    consultationDateTime?: string; subtotal?: number; discount?: number; tax?: number; total?: number; paidAmount?: number;
    items?: { description?: string; quantity?: number; unitPrice?: number; totalPrice?: number }[];
  }): void {
    const rows = (data.items ?? []).map(i =>
      `<tr><td>${i.description ?? ''}</td><td>${i.quantity ?? 1}</td><td>${i.unitPrice ?? ''}</td><td>${i.totalPrice ?? ''}</td></tr>`
    ).join('');
    const details = [
      data.consultationTitle ? `<div><strong>${this.t('PRINT.CONSULTATION')}:</strong> ${data.consultationTitle}</div>` : '',
      data.consultationDateTime ? `<div><strong>${this.t('PRINT.DATE')}:</strong> ${data.consultationDateTime}</div>` : '',
      data.doctorName ? `<div><strong>${this.t('PRINT.DOCTOR')}:</strong> ${data.doctorName}${data.doctorSpecialty ? ` · ${data.doctorSpecialty}` : ''}</div>` : '',
      data.patientName ? `<div><strong>${this.t('PRINT.PATIENT')}:</strong> ${data.patientName}</div>` : '',
      data.patientPhone ? `<div><strong>${this.t('PRINT.PHONE')}:</strong> ${data.patientPhone}</div>` : '',
      data.patientAge ? `<div><strong>${this.t('PRINT.AGE')}:</strong> ${data.patientAge}</div>` : ''
    ].filter(Boolean).join('');
    this.openHtml(data.invoiceNo ?? 'Invoice', `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;">
        <div>
          <h1 style="margin:0 0 4px;">${data.clinicName ?? this.t('PRINT.CLINIC')}</h1>
          <div class="meta">${data.clinicAddress ?? ''}</div>
          <div class="meta">${data.clinicPhone ?? ''}</div>
        </div>
        <div style="border:1px solid #dfe7ef;padding:10px 12px;border-radius:8px;min-width:180px;text-align:center;color:#1f4e79;">
          <strong>${this.t('BILLING.INVOICE')}</strong><br>${data.invoiceNo ?? ''}
        </div>
      </div>
      <div class="meta">${data.createdAt ?? ''} · ${data.status ?? ''}</div>
      <div class="meta">${details}</div>
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
