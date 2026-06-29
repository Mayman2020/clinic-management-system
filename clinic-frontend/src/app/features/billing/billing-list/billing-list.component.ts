import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../core/models/billing.model';
import { SnackService } from '../../../core/services/snack.service';
import { PrintService } from '../../../core/services/print.service';
import { InvoiceDialogComponent } from '../invoice-dialog/invoice-dialog.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { InsuranceClaimDialogComponent } from '../../insurance/insurance-claim-dialog/insurance-claim-dialog.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, RouterLink, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, MatTooltipModule, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './billing-list.component.html',
  styleUrl: './billing-list.component.scss'
})
export class BillingListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 10;
  total = 0;
  search = '';
  statusFilter = '';
  rows: Invoice[] = [];
  displayedColumns = ['invoiceNo', 'patientName', 'total', 'status', 'actions'];
  columns = [{ key: 'invoiceNo', labelKey: 'BILLING.INVOICE_NO' }, { key: 'patientName', labelKey: 'APPOINTMENTS.PATIENT' }, { key: 'total', labelKey: 'BILLING.TOTAL' }, { key: 'status', labelKey: 'COMMON.STATUS' }];
  statusOptions = ['PENDING', 'PARTIAL', 'PAID'];

  constructor(private readonly svc: BillingService, private readonly snack: SnackService, private readonly dialogs: RmsDialogService, private readonly print: PrintService, private readonly router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    const params: Record<string, string | number> = {};
    if (this.search.trim()) params['q'] = this.search.trim();
    if (this.statusFilter) params['status'] = this.statusFilter;
    this.svc.listInvoices(this.page, this.size, params).subscribe({
      next: (res) => {
        this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0;
        this.listLoad.end();
      },
      error: (err) => {
        this.snack.error(err.message);
        this.rows = [];
        this.total = 0;
        this.listLoad.end();
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.load();
  }

  onFilterChange(): void {
    this.page = 0;
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!(this.search.trim() || this.statusFilter);
  }

  onCreate(): void {
    this.dialogs.open(InvoiceDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onPay(row: Invoice): void {
    this.dialogs.open(PaymentDialogComponent, { width: '420px', data: row }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onInsuranceClaim(row: Invoice): void {
    this.dialogs.open(InsuranceClaimDialogComponent, {
      width: '480px',
      data: { patientId: row.patientId, invoiceId: row.id, amount: row.total }
    }).afterClosed().subscribe((saved) => { if (saved) this.snack.success('COMMON.SAVED'); });
  }

  onPrint(row: Invoice): void {
    this.svc.getPrint(row.id).subscribe({
      next: (res) => { if (res.data) this.print.invoice(res.data as Parameters<PrintService['invoice']>[0]); },
      error: (e) => this.snack.error(e.message)
    });
  }

  onDownloadPdf(row: Invoice): void {
    this.svc.downloadPdf(row.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${row.invoiceNo || 'invoice'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (e) => this.snack.error(e.message)
    });
  }

  onView(row: Invoice): void {
    void this.router.navigate(['/admin/billing', row.id]);
  }

  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
