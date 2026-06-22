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
import { LabService } from '../../../core/services/lab.service';
import { LabRequest } from '../../../core/models/lab.model';
import { SnackService } from '../../../core/services/snack.service';
import { LabDialogComponent } from '../lab-dialog/lab-dialog.component';

const LAB_FLOW = ['REQUESTED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'];

@Component({
  selector: 'app-lab-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, MatPaginatorModule, MatDialogModule, PageHeaderComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './lab-list.component.html',
  styleUrl: './lab-list.component.scss'
})
export class LabListComponent implements OnInit {
  loading = false;
  page = 0;
  size = 10;
  total = 0;
  search = '';
  rows: LabRequest[] = [];
  displayedColumns = ['requestNo', 'testType', 'status', 'actions'];
  columns = [{ key: 'requestNo', labelKey: 'LAB.REQUEST_NO' }, { key: 'testType', labelKey: 'LAB.TEST_TYPE' }, { key: 'status', labelKey: 'COMMON.STATUS' }];

  constructor(private readonly svc: LabService, private readonly snack: SnackService, private readonly dialog: MatDialog) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list(this.page, this.size).subscribe({
      next: (res) => { this.rows = res.data?.content ?? [];
        this.total = res.data?.totalElements ?? 0; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }

  onCreate(): void {
    this.dialog.open(LabDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  nextStatus(row: LabRequest): string | null {
    const idx = LAB_FLOW.indexOf(row.status);
    return idx >= 0 && idx < LAB_FLOW.length - 1 ? LAB_FLOW[idx + 1] : null;
  }

  onAdvance(row: LabRequest): void {
    const next = this.nextStatus(row);
    if (!next) return;
    this.svc.updateStatus(row.id, next).subscribe({
      next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.load(); },
      error: (e) => this.snack.error(e.message)
    });
  }
  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }
}
