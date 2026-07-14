import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { LabService } from '../../../core/services/lab.service';
import { LabRequest } from '../../../core/models/lab.model';
import { SnackService } from '../../../core/services/snack.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LabDialogComponent } from '../lab-dialog/lab-dialog.component';
import { LabResultDialogComponent } from '../lab-result-dialog/lab-result-dialog.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';

const LAB_FLOW = ['REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'];

@Component({
  selector: 'app-lab-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, MatTooltipModule, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './lab-list.component.html',
  styleUrl: './lab-list.component.scss'
})
export class LabListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 10;
  total = 0;
  search = '';
  statusFilter = '';
  statusOptions = LAB_FLOW;
  rows: LabRequest[] = [];
  displayedColumns = ['requestNo', 'testType', 'status', 'actions'];
  columns = [{ key: 'requestNo', labelKey: 'LAB.REQUEST_NO' }, { key: 'testType', labelKey: 'LAB.TEST_TYPE' }, { key: 'status', labelKey: 'COMMON.STATUS' }];

  constructor(private readonly svc: LabService, private readonly snack: SnackService, private readonly dialogs: RmsDialogService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    const params: Record<string, string | number> = {};
    if (this.search.trim()) params['q'] = this.search.trim();
    if (this.statusFilter) params['status'] = this.statusFilter;
    this.svc.list(this.page, this.size, params).subscribe({
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

  onSearch(): void { this.page = 0; this.load(); }
  onFilterChange(): void { this.page = 0; this.load(); }
  hasActiveFilters(): boolean { return !!this.search.trim() || !!this.statusFilter; }

  onCreate(): void {
    this.dialogs.open(LabDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  nextStatus(row: LabRequest): string | null {
    const idx = LAB_FLOW.indexOf(row.status);
    return idx >= 0 && idx < LAB_FLOW.length - 1 ? LAB_FLOW[idx + 1] : null;
  }

  onAdvance(row: LabRequest): void {
    const next = this.nextStatus(row);
    if (!next) return;
    if (next === 'COMPLETED') {
      this.dialogs.open(LabResultDialogComponent, { width: '440px' }).afterClosed().subscribe((result) => {
        const data = result as { resultPdfUrl?: string } | undefined;
        if (!data) return;
        this.svc.updateStatus(row.id, next, data.resultPdfUrl).subscribe({
          next: (res) => {
            this.snack.success('MESSAGES.STATUS_UPDATED');
            if (res.data?.generatedInvoiceId) this.snack.success('WORKFLOW.INVOICE_AUTO_CREATED');
            this.load();
          },
          error: (e) => this.snack.error(e.message)
        });
      });
      return;
    }
    this.svc.updateStatus(row.id, next).subscribe({
      next: (res) => {
        this.snack.success('MESSAGES.STATUS_UPDATED');
        if (res.data?.generatedInvoiceId) this.snack.success('WORKFLOW.INVOICE_AUTO_CREATED');
        this.load();
      },
      error: (e) => this.snack.error(e.message)
    });
  }
  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
