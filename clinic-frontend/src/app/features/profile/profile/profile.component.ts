import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { IdentityMediaFieldsComponent } from '../../../shared/components/identity-media-fields/identity-media-fields.component';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    IdentityMediaFieldsComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  passwordForm: FormGroup;
  loading = true;
  saving = false;
  changingPassword = false;
  highlightPassword = false;
  accountEmail = '';
  accountUsername = '';
  dashboardRoute = '/admin/dashboard';

  constructor(
    private readonly fb: FormBuilder,
    private readonly profile: UserProfileService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    private readonly navHistory: NavigationHistoryService
  ) {
    this.form = this.fb.group({
      fullNameAr: ['', [Validators.required, Validators.maxLength(150)]],
      fullNameEn: ['', [Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(20)]],
      profileImageUrl: ['', [Validators.maxLength(500)]]
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.dashboardRoute = this.auth.getDashboardRoute();
    this.highlightPassword = this.route.snapshot.queryParamMap.get('changePassword') === '1';
    this.loadProfile();
  }

  goBack(): void {
    if (this.navHistory.canGoBack()) {
      this.navHistory.goBack(this.location);
      return;
    }
    this.location.back();
  }

  get heroProfileImageUrl(): string | null {
    const v = (this.form.get('profileImageUrl')?.value as string | undefined)?.trim();
    return v || null;
  }

  heroInitials(): string {
    return this.auth.getCurrentUser()?.initials || 'U';
  }

  roleLabel(): string {
    const role = this.auth.getRole();
    return role ? this.i18n.instant(`ROLE.${role}`) : '';
  }

  profileDisplayName(): string {
    const ar = (this.form.get('fullNameAr')?.value as string | undefined)?.trim();
    const en = (this.form.get('fullNameEn')?.value as string | undefined)?.trim();
    return this.i18n.currentLang === 'ar' ? (ar || en || '') : (en || ar || '');
  }

  onProfileImageUrlChange(url: string): void {
    this.form.patchValue({ profileImageUrl: url || '' });
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    const v = this.form.getRawValue();
    const fullNameAr = (v.fullNameAr as string).trim();
    const fullNameEn = (v.fullNameEn as string)?.trim() || undefined;
    const fullName = this.i18n.currentLang === 'ar'
      ? (fullNameAr || fullNameEn || '')
      : (fullNameEn || fullNameAr || '');
    this.profile.updateMyProfile({
      fullName,
      phone: (v.phone as string)?.trim() || undefined
    }).subscribe({
      next: (res) => {
        const dto = res.data;
        this.auth.syncProfileLocal({
          fullName: dto?.fullName ?? fullName,
          fullNameAr,
          fullNameEn,
          phone: (v.phone as string)?.trim() || dto?.phone,
          profileImageUrl: (v.profileImageUrl as string)?.trim() || undefined
        });
        this.saving = false;
        this.snack.success(this.i18n.instant('PROFILE.SAVE_SUCCESS'));
      },
      error: (err: Error) => {
        this.saving = false;
        this.snack.error(err.message || this.i18n.instant('PROFILE.SAVE_ERROR'));
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.changingPassword) return;
    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.snack.error(this.i18n.instant('PROFILE.PASSWORD_MISMATCH'));
      return;
    }
    this.changingPassword = true;
    this.profile.changeMyPassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        if (res.data) this.auth.applyLoginResponse(res.data);
        this.changingPassword = false;
        this.highlightPassword = false;
        this.auth.clearMustChangePassword();
        this.passwordForm.reset();
        this.snack.success(this.i18n.instant('PROFILE.PASSWORD_CHANGED'));
      },
      error: (err: Error) => {
        this.changingPassword = false;
        this.snack.error(err.message || this.i18n.instant('PROFILE.PASSWORD_CHANGE_ERROR'));
      }
    });
  }

  private loadProfile(): void {
    this.loading = true;
    this.profile.getMyProfile().subscribe({
      next: (res) => {
        const user = res.data;
        const current = this.auth.getCurrentUser();
        this.accountEmail = user?.email ?? current?.email ?? '';
        this.accountUsername = user?.username ?? current?.username ?? '';
        const fullName = user?.fullName ?? current?.fullName ?? '';
        this.form.patchValue({
          fullNameAr: user?.fullNameAr ?? current?.fullNameAr ?? fullName,
          fullNameEn: user?.fullNameEn ?? current?.fullNameEn ?? fullName,
          phone: user?.phone ?? current?.phone ?? '',
          profileImageUrl: user?.profileImageUrl ?? current?.profileImageUrl ?? ''
        });
        this.loading = false;
      },
      error: (err: Error) => {
        const user = this.auth.getCurrentUser();
        this.accountEmail = user?.email ?? '';
        this.accountUsername = user?.username ?? '';
        this.form.patchValue({
          fullNameAr: user?.fullNameAr ?? user?.fullName ?? '',
          fullNameEn: user?.fullNameEn ?? user?.fullName ?? '',
          phone: user?.phone ?? '',
          profileImageUrl: user?.profileImageUrl ?? ''
        });
        this.loading = false;
        if (err.message) this.snack.error(err.message);
      }
    });
  }
}
