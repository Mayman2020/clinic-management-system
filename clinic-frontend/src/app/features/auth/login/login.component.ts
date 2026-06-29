import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService, LangCode, LanguageOption } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf, NgFor, AsyncPipe, RouterLink, FormsModule, ReactiveFormsModule, TranslateModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  rememberMe = false;
  error = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly permissions: PermissionService,
    private readonly router: Router,
    private readonly snack: SnackService,
    readonly i18n: I18nService,
    readonly theme: ThemeService
  ) {
    this.form = this.fb.group({
      username: ['admin', Validators.required],
      password: ['', Validators.required]
    });
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl(this.auth.getDashboardRoute());
    }
  }

  get languages(): LanguageOption[] {
    return this.i18n.languages;
  }

  get activeLanguage(): LanguageOption {
    return this.languages.find((l) => l.code === this.i18n.currentLang) ?? this.languages[0];
  }

  get themeTooltipKey(): string {
    return this.theme.isDark ? 'TOPBAR.LIGHT_MODE' : 'TOPBAR.DARK_MODE';
  }

  setLang(code: LangCode): void {
    this.i18n.setLang(code).subscribe();
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value).pipe(
      switchMap(() => this.auth.mustChangePassword() ? of(null) : this.permissions.loadMine())
    ).subscribe({
      next: () => {
        this.loading = false;
        if (this.auth.mustChangePassword()) {
          void this.router.navigateByUrl('/admin/profile?changePassword=1');
          return;
        }
        void this.router.navigateByUrl(this.auth.getDashboardRoute());
      },
      error: (err: Error & { status?: number }) => {
        this.loading = false;
        this.error = err?.status === 401 || err?.status === 400
          ? this.i18n.instant('AUTH.INVALID_CREDENTIALS')
          : err.message || this.i18n.instant('AUTH.LOGIN_FAILED');
        this.snack.error(this.error);
      }
    });
  }
}
