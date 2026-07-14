import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';
import { UserRole } from '../../core/models/user.model';
import { ClinicLogoComponent } from '../../shared/components/clinic-logo/clinic-logo.component';

interface NavItem {
  icon: string; labelKey: string; route: string; roles: UserRole[]; permissionKey: string; tone: string;
  sectionKey: 'NAV_SECTION.OVERVIEW' | 'NAV_SECTION.CLINICAL' | 'NAV_SECTION.OPERATIONS' | 'NAV_SECTION.FINANCE' | 'NAV_SECTION.ADMIN';
}

@Component({
  selector: 'app-sidebar', standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive, MatTooltipModule, TranslateModule, ClinicLogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() lang: 'ar' | 'en' = 'ar';
  @Output() collapseToggle = new EventEmitter<void>();

  sectionExpanded: Record<string, boolean> = {
    'NAV_SECTION.OVERVIEW': true, 'NAV_SECTION.CLINICAL': true, 'NAV_SECTION.OPERATIONS': true,
    'NAV_SECTION.FINANCE': true, 'NAV_SECTION.ADMIN': true
  };

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/admin/dashboard', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE','LAB_TECHNICIAN','RADIOLOGY_STAFF','CASHIER'], permissionKey: 'dashboard', tone: 'purple', sectionKey: 'NAV_SECTION.OVERVIEW' },
    { icon: 'groups', labelKey: 'NAV.PATIENTS', route: '/admin/patients', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE','CASHIER'], permissionKey: 'patients', tone: 'cyan', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'medical_services', labelKey: 'NAV.DOCTORS', route: '/admin/doctors', roles: ['ADMIN','RECEPTIONIST','DOCTOR'], permissionKey: 'doctors', tone: 'teal', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'event', labelKey: 'NAV.APPOINTMENTS', route: '/admin/appointments', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE'], permissionKey: 'appointments', tone: 'orange', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'calendar_month', labelKey: 'NAV.CALENDAR', route: '/admin/calendar', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE'], permissionKey: 'calendar', tone: 'indigo', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'queue', labelKey: 'NAV.QUEUE', route: '/admin/queue', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE'], permissionKey: 'queue', tone: 'rose', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'tv', labelKey: 'NAV.QUEUE_TV', route: '/queue/tv', roles: ['ADMIN','RECEPTIONIST','NURSE'], permissionKey: 'queue', tone: 'slate', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'assignment', labelKey: 'NAV.CONSULTATION', route: '/admin/consultation', roles: ['ADMIN','DOCTOR','NURSE'], permissionKey: 'consultation', tone: 'green', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'medication', labelKey: 'NAV.PRESCRIPTION', route: '/admin/prescription', roles: ['ADMIN','DOCTOR'], permissionKey: 'prescription', tone: 'purple', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'science', labelKey: 'NAV.LAB', route: '/admin/lab', roles: ['ADMIN','DOCTOR','LAB_TECHNICIAN'], permissionKey: 'lab', tone: 'cyan', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'biotech', labelKey: 'NAV.RADIOLOGY', route: '/admin/radiology', roles: ['ADMIN','DOCTOR','RADIOLOGY_STAFF'], permissionKey: 'radiology', tone: 'indigo', sectionKey: 'NAV_SECTION.CLINICAL' },
    { icon: 'receipt_long', labelKey: 'NAV.BILLING', route: '/admin/billing', roles: ['ADMIN','RECEPTIONIST','CASHIER'], permissionKey: 'billing', tone: 'gold', sectionKey: 'NAV_SECTION.FINANCE' },
    { icon: 'health_and_safety', labelKey: 'NAV.INSURANCE', route: '/admin/insurance', roles: ['ADMIN','CASHIER'], permissionKey: 'insurance', tone: 'teal', sectionKey: 'NAV_SECTION.FINANCE' },
    { icon: 'desk', labelKey: 'NAV.RECEPTION', route: '/admin/reception', roles: ['ADMIN','RECEPTIONIST'], permissionKey: 'appointments', tone: 'orange', sectionKey: 'NAV_SECTION.OPERATIONS' },
    { icon: 'bar_chart', labelKey: 'NAV.REPORTS', route: '/admin/reports', roles: ['ADMIN','CASHIER'], permissionKey: 'reports', tone: 'green', sectionKey: 'NAV_SECTION.FINANCE' },
    { icon: 'notifications', labelKey: 'NAV.NOTIFICATIONS', route: '/admin/notifications', roles: ['ADMIN','RECEPTIONIST','DOCTOR','NURSE','LAB_TECHNICIAN','RADIOLOGY_STAFF','CASHIER'], permissionKey: 'dashboard', tone: 'rose', sectionKey: 'NAV_SECTION.OVERVIEW' },
    { icon: 'history', labelKey: 'NAV.AUDIT', route: '/admin/audit-logs', roles: ['ADMIN'], permissionKey: 'reports', tone: 'slate', sectionKey: 'NAV_SECTION.ADMIN' },
    { icon: 'account_tree', labelKey: 'NAV.BRANCHES', route: '/admin/branches', roles: ['ADMIN'], permissionKey: 'settings', tone: 'cyan', sectionKey: 'NAV_SECTION.ADMIN' },
    { icon: 'admin_panel_settings', labelKey: 'NAV.PERMISSIONS', route: '/admin/permissions', roles: ['ADMIN'], permissionKey: 'permissions', tone: 'purple', sectionKey: 'NAV_SECTION.ADMIN' },
    { icon: 'settings', labelKey: 'NAV.SETTINGS', route: '/admin/settings', roles: ['ADMIN'], permissionKey: 'settings', tone: 'slate', sectionKey: 'NAV_SECTION.ADMIN' },
    { icon: 'list_alt', labelKey: 'NAV.LOOKUPS', route: '/admin/lookups', roles: ['ADMIN'], permissionKey: 'settings', tone: 'gold', sectionKey: 'NAV_SECTION.ADMIN' },
    { icon: 'manage_accounts', labelKey: 'NAV.USERS', route: '/admin/users', roles: ['ADMIN'], permissionKey: 'users', tone: 'indigo', sectionKey: 'NAV_SECTION.ADMIN' },
  ];

  constructor(
    readonly auth: AuthService,
    private readonly permissions: PermissionService,
    private readonly router: Router,
    private readonly navHistory: NavigationHistoryService
  ) {}

  get visibleSections() {
    const role = this.auth.getRole();
    const items = this.navItems.filter((i) => role && i.roles.includes(role) && this.permissions.can(i.permissionKey, 'menu'));
    const keys = ['NAV_SECTION.OVERVIEW','NAV_SECTION.CLINICAL','NAV_SECTION.OPERATIONS','NAV_SECTION.FINANCE','NAV_SECTION.ADMIN'];
    return keys.map((k) => ({ key: k, items: items.filter((i) => i.sectionKey === k) })).filter((s) => s.items.length);
  }

  get currentUser() { return this.auth.getCurrentUser(); }
  get currentUserDisplayName(): string {
    const u = this.currentUser;
    if (!u) return '';
    const ar = (u.fullNameAr ?? '').trim();
    const en = (u.fullNameEn ?? '').trim();
    return this.lang === 'ar' ? (ar || en || u.fullName) : (en || ar || u.fullName);
  }
  get roleKey(): string { const r = this.auth.getRole(); return r ? `ROLE.${r}` : ''; }
  logout(): void { this.auth.logout(); }
  onMenuNav(): void { this.navHistory.markFromMenu(); }
  toggleSection(k: string): void { this.sectionExpanded[k] = !this.sectionExpanded[k]; }
  trackBySection(_: number, s: { key: string }) { return s.key; }
  trackByRoute(_: number, i: NavItem) { return i.route; }
  isForcedActive(item: NavItem): boolean { return this.router.url.split('?')[0] === item.route; }
  get collapseIcon(): string {
    if (this.collapsed) {
      return this.lang === 'ar' ? 'chevron_left' : 'chevron_right';
    }
    return this.lang === 'ar' ? 'chevron_right' : 'chevron_left';
  }
}
