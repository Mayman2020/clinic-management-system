import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService, LanguageOption } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-topbar', standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, RouterLink, TranslateModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatBadgeModule, MatDividerModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Input() sidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  unreadCount = 0;
  private pollTimer?: ReturnType<typeof setInterval>;

  constructor(
    readonly theme: ThemeService,
    readonly i18n: I18nService,
    readonly auth: AuthService,
    private readonly permissions: PermissionService,
    private readonly router: Router,
    private readonly notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.refreshUnread();
    this.pollTimer = setInterval(() => this.refreshUnread(), 45000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  refreshUnread(): void {
    if (!this.auth.isAuthenticated()) return;
    this.notifications.unreadCount().subscribe({
      next: (r) => { this.unreadCount = r.data?.unreadCount ?? 0; },
      error: () => { /* silent */ }
    });
  }

  get currentUser() { return this.auth.getCurrentUser(); }
  get currentUserDisplayName(): string {
    const u = this.currentUser; if (!u) return '';
    return this.i18n.currentLang === 'ar' ? (u.fullNameAr || u.fullNameEn || u.fullName) : (u.fullNameEn || u.fullNameAr || u.fullName);
  }
  get switchableRoles(): UserRole[] { return this.auth.getEffectiveRoles(); }
  get languages(): LanguageOption[] { return this.i18n.languages; }
  get activeLanguage(): LanguageOption { return this.languages.find((l) => l.code === this.i18n.currentLang) ?? this.languages[0]; }
  isRoleActive(role: UserRole): boolean { return this.auth.getRole() === role; }
  switchLang(lang: LanguageOption): void { this.i18n.setLang(lang.code).subscribe(); }
  toggleTheme(): void { this.theme.toggle(); }
  logout(): void { this.auth.logout(); }
  switchRole(role: UserRole): void {
    if (this.isRoleActive(role)) return;
    this.auth.setActiveRole(role);
    this.permissions.loadMine().subscribe({ next: () => void this.router.navigateByUrl(this.auth.getDashboardRoute()) });
  }
}
