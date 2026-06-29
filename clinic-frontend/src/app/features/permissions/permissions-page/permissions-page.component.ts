import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RolePermissionService, RolePermissionDto } from '../../../core/services/role-permission.service';
import { ModulePermissions, PermissionAction, USER_ROLE_VALUES, UserRole } from '../../../core/models/user.model';
import { SnackService } from '../../../core/services/snack.service';

const ACTIONS: PermissionAction[] = ['enabled', 'menu', 'view', 'create', 'edit', 'delete', 'export', 'approve'];

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [
    NgFor, NgIf, FormsModule, TranslateModule, MatFormFieldModule, MatSelectModule,
    MatCheckboxModule, MatButtonModule, MatProgressSpinnerModule, PageHeaderComponent
  ],
  templateUrl: './permissions-page.component.html',
  styleUrl: './permissions-page.component.scss'
})
export class PermissionsPageComponent implements OnInit {
  loading = true;
  saving = false;
  roles = USER_ROLE_VALUES.filter((r) => r !== 'ADMIN');
  selectedRole: UserRole = 'RECEPTIONIST';
  allRoles: RolePermissionDto[] = [];
  permissions: Record<string, ModulePermissions> = {};
  modules: string[] = [];
  readonly actions = ACTIONS;

  constructor(
    private readonly svc: RolePermissionService,
    private readonly snack: SnackService
  ) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (r) => {
        this.allRoles = r.data ?? [];
        this.applyRole(this.selectedRole);
        this.loading = false;
      },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  onRoleChange(): void {
    this.applyRole(this.selectedRole);
  }

  applyRole(role: UserRole): void {
    const found = this.allRoles.find((x) => x.role === role);
    this.permissions = { ...(found?.permissions ?? {}) };
    this.modules = Object.keys(this.permissions);
  }

  moduleLabel(key: string): string {
    return `NAV.${key.toUpperCase()}` in { } ? key : key;
  }

  isChecked(module: string, action: PermissionAction): boolean {
    return this.permissions[module]?.[action] === true;
  }

  toggle(module: string, action: PermissionAction, checked: boolean): void {
    if (!this.permissions[module]) this.permissions[module] = {} as ModulePermissions;
    this.permissions[module][action] = checked;
  }

  save(): void {
    this.saving = true;
    this.svc.update(this.selectedRole, this.permissions).subscribe({
      next: (r) => {
        const idx = this.allRoles.findIndex((x) => x.role === this.selectedRole);
        if (idx >= 0 && r.data) this.allRoles[idx] = r.data;
        this.snack.success('COMMON.SAVED');
        this.saving = false;
      },
      error: (e) => { this.snack.error(e.message); this.saving = false; }
    });
  }
}
