import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice, InvoiceItem, Payment } from '../../../core/models/billing.model';
import { SnackService } from '../../../core/services/snack.service';
import { PrintService } from '../../../core/services/print.service';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-billing-detail',
  standalone: true,
  imports: [
    NgFor, NgIf, DecimalPipe, RouterLink, TranslateModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule, MatTableModule,
    PageHeaderComponent, TranslateKeyPipe, HasPermissionDirective, RmsDatePipe
  ],
  templateUrl: './billing-detail.component.html',
  styleUrl: './billing-detail.component.scss'
})
export class BillingDetailComponent implements OnInit {
  loading = true;
  invoice?: Invoice;
  items: InvoiceItem[] = [];
  payments: Payment[] = [];
  itemColumns = ['description', 'quantity', 'unitPrice', 'totalPrice'];
  paymentColumns = ['paidAt', 'amount', 'paymentMethod'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly svc: BillingService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService,
    private readonly print: PrintService
  ) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    if (!id) { void this.router.navigate(['/admin/billing']); return; }
    this.load(id);
  }

  load(id: number): void {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: (r) => {
        this.invoice = r.data;
        this.items = r.data?.items ?? [];
        this.payments = r.data?.payments ?? [];
        this.loading = false;
      },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  onPay(): void {
    if (!this.invoice) return;
    this.dialogs.open(PaymentDialogComponent, { width: '420px', data: this.invoice })
      .afterClosed().subscribe((saved) => { if (saved && this.invoice) this.load(this.invoice.id); });
  }

  onMixedPay(): void {
    if (!this.invoice) return;
    this.dialogs.open(PaymentDialogComponent, { width: '420px', data: this.invoice })
      .afterClosed().subscribe((saved) => { if (saved && this.invoice) this.load(this.invoice.id); });
  }

  onPrint(): void {
    if (!this.invoice) return;
    this.svc.getPrint(this.invoice.id).subscribe({
      next: (res) => { if (res.data) this.print.invoice(res.data as Parameters<PrintService['invoice']>[0]); },
      error: (e) => this.snack.error(e.message)
    });
  }

  onDownloadPdf(): void {
    if (!this.invoice) return;
    this.svc.downloadPdf(this.invoice.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.invoice!.invoiceNo || 'invoice'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => this.snack.error(e.message)
    });
  }
}
