import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { InsuranceService } from '../../../core/services/insurance.service';
import { InsuranceClaim, InsuranceProvider } from '../../../core/models/insurance.model';
import { SnackService } from '../../../core/services/snack.service';
import { InsuranceClaimDialogComponent } from '../insurance-claim-dialog/insurance-claim-dialog.component';
import { InsuranceProviderDialogComponent } from '../insurance-provider-dialog/insurance-provider-dialog.component';

@Component({
  selector: 'app-insurance-list', standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatSelectModule, TablePagerComponent, MatTabsModule, MatDialogModule, PageHeaderComponent, RmsIconBtnComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './insurance-list.component.html',
  styleUrl: './insurance-list.component.scss'
})
export class InsuranceListComponent implements OnInit {
  tab = 0;
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  search = '';
  statusFilter = '';
  providerSearch = '';
  rows: InsuranceClaim[] = [];
  providers: InsuranceProvider[] = [];
  claimColumns = ['claimNo', 'invoiceNo', 'amount', 'status', 'actions'];
  claimDefs = [
    { key: 'claimNo', labelKey: 'INSURANCE.CLAIM_NO' },
    { key: 'invoiceNo', labelKey: 'BILLING.INVOICE_NO' },
    { key: 'amount', labelKey: 'BILLING.AMOUNT' },
    { key: 'status', labelKey: 'COMMON.STATUS' }
  ];
  claimStatusOptions = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'];
  providerColumns = ['name', 'contactPhone', 'contactEmail', 'actions'];

  constructor(private readonly svc: InsuranceService, private readonly snack: SnackService, private readonly dialogs: RmsDialogService) {}

  ngOnInit(): void { this.loadClaims(); this.loadProviders(); }

  loadClaims(): void {
    this.loading = true;
    const params: Record<string, string | number> = {};
    if (this.search.trim()) params['q'] = this.search.trim();
    if (this.statusFilter) params['status'] = this.statusFilter;
    this.svc.listClaims(this.page, this.size, params).subscribe({
      next: (res) => { this.rows = res.data?.content ?? []; this.total = res.data?.totalElements ?? 0; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  loadProviders(): void {
    this.svc.listProviders().subscribe({
      next: (res) => { this.providers = res.data ?? []; },
      error: (err) => this.snack.error(err.message)
    });
  }

  onCreateClaim(): void {
    this.dialogs.open(InsuranceClaimDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.loadClaims(); });
  }

  onCreateProvider(): void {
    this.dialogs.open(InsuranceProviderDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.loadProviders(); });
  }

  onEditProvider(p: InsuranceProvider): void {
    this.dialogs.open(InsuranceProviderDialogComponent, { width: '480px', data: p }).afterClosed().subscribe((saved) => { if (saved) this.loadProviders(); });
  }

  onDeactivateProvider(p: InsuranceProvider): void {
    if (!p.id) return;
    this.svc.deactivateProvider(p.id).subscribe({
      next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.loadProviders(); },
      error: (e) => this.snack.error(e.message)
    });
  }

  onStatusChange(row: InsuranceClaim, status: string): void {
    if (!status || status === row.status) return;
    this.svc.updateClaimStatus(row.id, status).subscribe({
      next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.loadClaims(); },
      error: (e) => this.snack.error(e.message)
    });
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadClaims();
  }

  onPageIndexChange(index: number): void { this.page = index; this.loadClaims(); }

  get filteredProviders(): InsuranceProvider[] {
    const q = this.providerSearch.trim().toLowerCase();
    if (!q) return this.providers;
    return this.providers.filter(p =>
      (p.name ?? '').toLowerCase().includes(q) ||
      (p.contactPhone ?? '').toLowerCase().includes(q) ||
      (p.contactEmail ?? '').toLowerCase().includes(q)
    );
  }
}
