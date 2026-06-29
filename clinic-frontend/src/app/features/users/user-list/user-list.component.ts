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
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RmsIconBtnComponent } from '../../../shared/components/rms-icon-btn/rms-icon-btn.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { SnackService } from '../../../core/services/snack.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { ListLoadController } from '../../../shared/utils/list-load.util';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, TablePagerComponent, MatDialogModule, PageHeaderComponent, RmsIconBtnComponent, EmptyStateComponent, HasPermissionDirective, TranslateKeyPipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  listLoad = new ListLoadController();
  page = 0;
  size = 10;
  total = 0;
  search = '';
  roleFilter = '';
  rows: User[] = [];
  displayedColumns = ['username', 'email', 'role', 'actions'];
  columns = [{ key: 'username', labelKey: 'USERS.USERNAME' }, { key: 'email', labelKey: 'AUTH.EMAIL' }, { key: 'role', labelKey: 'USERS.ROLE' }];
  roleOptions = ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGY_STAFF', 'CASHIER'];

  constructor(private readonly svc: UserService, private readonly snack: SnackService, private readonly dialogs: RmsDialogService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.listLoad.begin();
    this.svc.list(this.page, this.size, this.search, this.roleFilter).subscribe({
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
    return !!(this.search.trim() || this.roleFilter);
  }

  onCreate(): void {
    this.dialogs.open(UserDialogComponent, { width: '520px' }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onEdit(row: User): void {
    this.dialogs.open(UserDialogComponent, { width: '520px', data: row }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  onToggle(row: User): void {
    this.svc.toggleActive(row.id).subscribe({
      next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.load(); },
      error: (e) => this.snack.error(e.message)
    });
  }

  onPageIndexChange(index: number): void { this.page = index; this.load(); }
}
