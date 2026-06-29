import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { Branch, BranchService } from '../../../core/services/branch.service';
import { SnackService } from '../../../core/services/snack.service';
import { BranchDialogComponent } from '../branch-dialog/branch-dialog.component';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [
    NgFor, NgIf, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule, MatTooltipModule, PageHeaderComponent, RmsIconBtnComponent, HasPermissionDirective
  ],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss'
})
export class BranchListComponent implements OnInit {
  loading = false;
  search = '';
  rows: Branch[] = [];
  displayedColumns = ['branchCode', 'name', 'phone', 'actions'];

  constructor(
    private readonly svc: BranchService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (r) => { this.rows = r.data ?? []; this.loading = false; },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  onCreate(): void {
    this.dialogs.open(BranchDialogComponent, { width: '480px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onEdit(row: Branch): void {
    this.dialogs.open(BranchDialogComponent, { width: '480px', data: row }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  get filteredRows(): Branch[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(b =>
      [b.branchCode, b.name, b.phone].some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }
}
