import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { SnackService } from '../../../core/services/snack.service';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule, TranslateModule, MatIconModule],
  template: `
    <div class="reset-page">
      <div class="reset-card">
        <a routerLink="/auth/login" class="back-link">
          <span class="material-icons">arrow_back</span>{{ 'COMMON.BACK' | translate }}
        </a>
        <div class="reset-icon">
          <img src="assets/images/clinic-logo.png" alt="" class="reset-logo" />
        </div>
        <h1>{{ 'AUTH.RESET_PASSWORD' | translate }}</h1>
        <p>{{ 'AUTH.RESET_PASSWORD_HINT' | translate }}</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label class="field-label">{{ 'AUTH.NEW_PASSWORD' | translate }}</label>
          <div class="login-field">
            <span class="material-icons">lock</span>
            <input formControlName="newPassword" type="password" [placeholder]="'AUTH.NEW_PASSWORD' | translate">
          </div>
          <label class="field-label">{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</label>
          <div class="login-field">
            <span class="material-icons">lock_outline</span>
            <input formControlName="confirmPassword" type="password" [placeholder]="'AUTH.CONFIRM_PASSWORD' | translate">
          </div>
          <p class="field-error" *ngIf="form.hasError('mismatch') && form.get('confirmPassword')?.touched">
            {{ 'AUTH.PASSWORD_MISMATCH' | translate }}
          </p>
          <button type="submit" class="submit-btn" [disabled]="form.invalid || !token || loading || done">
            {{ done ? ('AUTH.PASSWORD_UPDATED' | translate) : ('AUTH.UPDATE_PASSWORD' | translate) }}
          </button>
        </form>
        <p class="field-error" *ngIf="!token">{{ 'AUTH.INVALID_RESET_TOKEN' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    .reset-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--hero-gradient); }
    .reset-card { width: 100%; max-width: 420px; background: var(--white); border-radius: var(--r-xl); padding: 40px; box-shadow: var(--card-shadow); border: 1px solid var(--line); }
    .back-link { display: inline-flex; align-items: center; gap: 4px; color: var(--blue-600); text-decoration: none; font-size: 0.85rem; font-weight: 500; margin-bottom: 24px; }
    .reset-icon { width: 88px; height: 88px; border-radius: 16px; background: var(--surface); display: grid; place-items: center; margin: 0 auto 20px; padding: 10px; box-shadow: var(--shadow-soft); }
    .reset-logo { width: 100%; height: 100%; object-fit: contain; }
    h1 { margin: 0; font-size: 1.5rem; color: var(--gray-900); }
    p { margin: 8px 0 24px; color: var(--ink-500); font-size: 0.9rem; line-height: 1.5; }
    .field-label { font-size: 0.78rem; font-weight: 600; color: var(--ink-600); }
    .login-field { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 14px; border: 1px solid var(--line); border-radius: var(--r); background: var(--gray-50); margin: 8px 0 16px; }
    .login-field input { flex: 1; border: 0; outline: 0; background: transparent; font-family: inherit; }
    .field-error { color: var(--danger-600, #dc2626); font-size: 0.85rem; margin: 0 0 12px; }
    .submit-btn { width: 100%; min-height: 48px; border: 0; border-radius: var(--r); background: var(--primary-gradient); color: var(--white); font-weight: 600; cursor: pointer; font-family: inherit; }
    .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token = '';
  loading = false;
  done = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly snack: SnackService,
    private readonly auth: AuthService,
    readonly i18n: I18nService
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
  }

  submit(): void {
    if (this.form.invalid || !this.token || this.loading || this.done) return;
    this.loading = true;
    const newPassword = this.form.get('newPassword')?.value as string;
    this.auth.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.done = true;
        this.loading = false;
        this.snack.success(this.i18n.instant('AUTH.PASSWORD_UPDATED'));
      },
      error: (err) => {
        this.loading = false;
        this.snack.error(err.message || this.i18n.instant('AUTH.RESET_FAILED'));
      }
    });
  }
}
