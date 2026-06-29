import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLog } from '../../../core/models/audit.model';
import { SnackService } from '../../../core/services/snack.service';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { ListLoadController } from '../../../shared/utils/list-load.util';

@Component({
  selector: 'app-audit-log-list', standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatTableModule, MatProgressSpinnerModule, TablePagerComponent, MatButtonModule, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, RmsDatePipe],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss'
})
export class AuditLogListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 20;
  total = 0;
  search = '';
  rows: AuditLog[] = [];
  displayedColumns = ['createdAt', 'action', 'entityType', 'entityId', 'userId', 'details'];

  constructor(private readonly svc: AuditService, private readonly snack: SnackService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    this.svc.list(this.page, this.size, this.search).subscribe({
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

  onPageIndexChange(index: number): void {
    this.page = index;
    this.load();
  }

  hasActiveFilters(): boolean {
    return !!this.search.trim();
  }
}
