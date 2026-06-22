import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { BillingService } from '../../../core/services/billing.service';
import { Invoice } from '../../../core/models/billing.model';
import { SnackService } from '../../../core/services/snack.service';
import { PrintService } from '../../../core/services/print.service';
import { InvoiceDialogComponent } from '../invoice-dialog/invoice-dialog.component';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatPaginatorModule, MatDialogModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './billing-list.component.html',
  styleUrl: './billing-list.component.scss'
})
export class BillingListComponent implements OnInit {
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  rows: Invoice[] = [];
  displayedColumns = ['invoiceNo', 'patientName', 'total', 'status', 'actions'];
  columns = [{ key: 'invoiceNo', labelKey: 'BILLING.INVOICE_NO' }, { key: 'patientName', labelKey: 'APPOINTMENTS.PATIENT' }, { key: 'total', labelKey: 'BILLING.TOTAL' }, { key: 'status', labelKey: 'COMMON.STATUS' }];

  constructor(private readonly svc: BillingService, private readonly snack: SnackService, private readonly dialog: MatDialog, private readonly print: PrintService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.listInvoices(this.page, this.size).subscribe({
      next: (res) => { this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onCreate(): void {
    this.dialog.open(InvoiceDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onPay(row: Invoice): void {
    this.dialog.open(PaymentDialogComponent, { width: '420px', data: row }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onPrint(row: Invoice): void {
    this.svc.getPrint(row.id).subscribe({
      next: (res) => { if (res.data) this.print.invoice(res.data as Parameters<PrintService['invoice']>[0]); },
      error: (e) => this.snack.error(e.message)
    });
  }
  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }
}
