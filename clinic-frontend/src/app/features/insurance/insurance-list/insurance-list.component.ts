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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { InsuranceService } from '../../../core/services/insurance.service';
import { InsuranceClaim, InsuranceProvider } from '../../../core/models/insurance.model';
import { SnackService } from '../../../core/services/snack.service';
import { InsuranceClaimDialogComponent } from '../insurance-claim-dialog/insurance-claim-dialog.component';
import { InsuranceProviderDialogComponent } from '../insurance-provider-dialog/insurance-provider-dialog.component';

@Component({
  selector: 'app-insurance-list', standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatPaginatorModule, MatTabsModule, MatDialogModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './insurance-list.component.html',
  styleUrl: './insurance-list.component.scss'
})
export class InsuranceListComponent implements OnInit {
  tab = 0;
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  rows: InsuranceClaim[] = [];
  providers: InsuranceProvider[] = [];
  claimColumns = ['claimNo', 'amount', 'status', 'actions'];
  claimDefs = [{ key: 'claimNo', labelKey: 'INSURANCE.CLAIM_NO' }, { key: 'amount', labelKey: 'BILLING.AMOUNT' }, { key: 'status', labelKey: 'COMMON.STATUS' }];
  providerColumns = ['name', 'contactPhone', 'contactEmail', 'actions'];

  constructor(private readonly svc: InsuranceService, private readonly snack: SnackService, private readonly dialog: MatDialog) {}

  ngOnInit(): void { this.loadClaims(); this.loadProviders(); }

  loadClaims(): void {
    this.loading = true;
    this.svc.listClaims(this.page, this.size).subscribe({
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
    this.dialog.open(InsuranceClaimDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.loadClaims(); });
  }

  onCreateProvider(): void {
    this.dialog.open(InsuranceProviderDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.loadProviders(); });
  }

  onEditProvider(p: InsuranceProvider): void {
    this.dialog.open(InsuranceProviderDialogComponent, { width: '480px', data: p }).afterClosed().subscribe((saved) => { if (saved) this.loadProviders(); });
  }

  onDeactivateProvider(p: InsuranceProvider): void {
    if (!p.id) return;
    this.svc.deactivateProvider(p.id).subscribe({
      next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.loadProviders(); },
      error: (e) => this.snack.error(e.message)
    });
  }

  onApprove(row: InsuranceClaim): void {
    this.svc.updateClaimStatus(row.id, 'APPROVED').subscribe({ next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.loadClaims(); }, error: (e) => this.snack.error(e.message) });
  }

  onReject(row: InsuranceClaim): void {
    this.svc.updateClaimStatus(row.id, 'REJECTED').subscribe({ next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.loadClaims(); }, error: (e) => this.snack.error(e.message) });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.loadClaims(); }
}
