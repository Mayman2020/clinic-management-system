import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SnackService } from '../../../core/services/snack.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, TranslateModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="forgot-page">
      <div class="forgot-card">
        <a routerLink="/auth/login" class="back-link">
          <span class="material-icons">arrow_back</span>{{ 'COMMON.BACK' | translate }}
        </a>
        <div class="forgot-icon">
          <img src="assets/images/clinic-logo.png" alt="" class="forgot-logo" />
        </div>
        <h1>{{ 'AUTH.FORGOT_PASSWORD' | translate }}</h1>
        <p>{{ 'AUTH.FORGOT_PASSWORD_HINT' | translate }}</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label class="field-label">{{ 'AUTH.USERNAME' | translate }}</label>
          <div class="login-field">
            <span class="material-icons">person</span>
            <input formControlName="username" type="text" [placeholder]="'AUTH.USERNAME' | translate">
          </div>
          <button type="submit" class="submit-btn" [disabled]="form.invalid || sent || loading">
            {{ sent ? ('AUTH.RESET_SENT' | translate) : ('AUTH.SEND_RESET' | translate) }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .forgot-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: var(--hero-gradient);
    }
    .forgot-card {
      width: 100%;
      max-width: 420px;
      background: var(--white);
      border-radius: var(--r-xl);
      padding: 40px;
      box-shadow: var(--card-shadow);
      border: 1px solid var(--line);
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--blue-600);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 24px;
    }
    .forgot-icon {
      width: 88px;
      height: 88px;
      border-radius: 16px;
      background: var(--surface);
      display: grid;
      place-items: center;
      margin: 0 auto 20px;
      padding: 10px;
      box-shadow: var(--shadow-soft);
    }
    .forgot-logo { width: 100%; height: 100%; object-fit: contain; }
    h1 { margin: 0; font-size: 1.5rem; color: var(--gray-900); }
    p { margin: 8px 0 24px; color: var(--ink-500); font-size: 0.9rem; line-height: 1.5; }
    .field-label { font-size: 0.78rem; font-weight: 600; color: var(--ink-600); }
    .login-field {
      display: flex; align-items: center; gap: 10px; min-height: 48px;
      padding: 0 14px; border: 1px solid var(--line); border-radius: var(--r);
      background: var(--gray-50); margin: 8px 0 20px;
    }
    .login-field input { flex: 1; border: 0; outline: 0; background: transparent; font-family: inherit; }
    .submit-btn {
      width: 100%; min-height: 48px; border: 0; border-radius: var(--r);
      background: var(--primary-gradient); color: var(--white);
      font-weight: 600; cursor: pointer; font-family: inherit;
    }
    .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  `]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  sent = false;
  loading = false;

  constructor(
    private readonly fb: FormBuilder,
    readonly i18n: I18nService,
    readonly theme: ThemeService,
    private readonly snack: SnackService,
    private readonly auth: AuthService
  ) {
    this.form = this.fb.group({ username: ['', Validators.required] });
  }

  submit(): void {
    if (this.form.invalid || this.sent || this.loading) return;
    this.loading = true;
    const username = this.form.get('username')?.value as string;
    this.auth.forgotPassword(username).subscribe({
      next: () => {
        this.sent = true;
        this.loading = false;
        this.snack.success(this.i18n.instant('AUTH.RESET_SENT'));
      },
      error: () => {
        this.loading = false;
        this.sent = true;
        this.snack.success(this.i18n.instant('AUTH.RESET_SENT'));
      }
    });
  }
}
