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
import { RadiologyService } from '../../../core/services/radiology.service';
import { FileService } from '../../../core/services/file.service';
import { RadiologyRequest } from '../../../core/models/radiology.model';
import { SnackService } from '../../../core/services/snack.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RadiologyDialogComponent } from '../radiology-dialog/radiology-dialog.component';
import { RadiologyResultDialogComponent } from '../radiology-result-dialog/radiology-result-dialog.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';

const RADIOLOGY_FLOW = ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

@Component({
  selector: 'app-radiology-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, MatTooltipModule, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './radiology-list.component.html',
  styleUrl: './radiology-list.component.scss'
})
export class RadiologyListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 10;
  total = 0;
  search = '';
  statusFilter = '';
  statusOptions = RADIOLOGY_FLOW;
  rows: RadiologyRequest[] = [];
  displayedColumns = ['requestNo', 'studyType', 'status', 'attachment', 'actions'];
  columns = [{ key: 'requestNo', labelKey: 'RADIOLOGY.REQUEST_NO' }, { key: 'studyType', labelKey: 'RADIOLOGY.STUDY_TYPE' }, { key: 'status', labelKey: 'COMMON.STATUS' }];
  uploadingId: number | null = null;

  constructor(
    private readonly svc: RadiologyService,
    private readonly files: FileService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService
  ) {}

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
    this.dialogs.open(RadiologyDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  nextStatus(row: RadiologyRequest): string | null {
    const idx = RADIOLOGY_FLOW.indexOf(row.status);
    return idx >= 0 && idx < RADIOLOGY_FLOW.length - 1 ? RADIOLOGY_FLOW[idx + 1] : null;
  }

  onAdvance(row: RadiologyRequest): void {
    const next = this.nextStatus(row);
    if (!next) return;
    if (next === 'COMPLETED') {
      this.dialogs.open(RadiologyResultDialogComponent, { width: '480px' }).afterClosed().subscribe((result) => {
        const data = result as { reportText?: string; imageUrl?: string } | undefined;
        if (!data) return;
        this.svc.updateStatus(row.id, next, { reportText: data.reportText, imageUrl: data.imageUrl }).subscribe({
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

  onUploadAttachment(row: RadiologyRequest, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    (event.target as HTMLInputElement).value = '';
    if (!file) return;
    this.uploadingId = row.id;
    this.files.upload(file).subscribe({
      next: (url) => {
        this.svc.uploadAttachment(row.id, url).subscribe({
          next: () => { this.snack.success('COMMON.SAVED'); this.uploadingId = null; this.load(); },
          error: (e) => { this.snack.error(e.message); this.uploadingId = null; }
        });
      },
      error: (e) => { this.snack.error(e.message); this.uploadingId = null; }
    });
  }

  openAttachment(url?: string): void {
    if (url) window.open(url, '_blank');
  }
}
