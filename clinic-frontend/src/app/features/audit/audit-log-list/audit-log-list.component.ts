import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLog } from '../../../core/models/audit.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-audit-log-list', standalone: true,
  imports: [NgFor, NgIf, TranslateModule, MatTableModule, MatProgressSpinnerModule, MatPaginatorModule, MatButtonModule, PageHeaderComponent],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss'
})
export class AuditLogListComponent implements OnInit {
  loading = false;
  page = 0;
  size = 20;
  total = 0;
  rows: AuditLog[] = [];
  displayedColumns = ['createdAt', 'action', 'entityType', 'entityId', 'userId', 'details'];

  constructor(private readonly svc: AuditService, private readonly snack: SnackService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list(this.page, this.size).subscribe({
      next: (res) => {
        this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0;
        this.loading = false;
      },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }
}
