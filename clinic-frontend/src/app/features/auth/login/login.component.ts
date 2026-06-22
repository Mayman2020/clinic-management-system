import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService, LanguageOption } from '../../../core/i18n/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login', standalone: true,
  imports: [NgIf, AsyncPipe, ReactiveFormsModule, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly permissions: PermissionService,
    private readonly router: Router, private readonly snack: SnackService, readonly i18n: I18nService, readonly theme: ThemeService) {
    this.form = this.fb.group({ username: ['admin', Validators.required], password: ['', Validators.required] });
    if (this.auth.isAuthenticated()) void this.router.navigateByUrl(this.auth.getDashboardRoute());
  }

  get languages(): LanguageOption[] { return this.i18n.languages; }

  get usernameCtrl() { return this.form.get('username')!; }
  get passwordCtrl() { return this.form.get('password')!; }

  toggleTheme(): void { this.theme.toggle(); }

  switchLang(code: 'ar' | 'en'): void { this.i18n.setLang(code).subscribe(); }

  submit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.value).pipe(switchMap(() => this.permissions.loadMine())).subscribe({
      next: () => { this.loading = false; void this.router.navigateByUrl(this.auth.getDashboardRoute()); },
      error: (err: Error & { status?: number }) => {
        this.loading = false;
        this.error = err?.status === 401 || err?.status === 400 ? this.i18n.instant('AUTH.INVALID_CREDENTIALS') : err.message || this.i18n.instant('AUTH.LOGIN_FAILED');
        this.snack.error(this.error);
      }
    });
  }
}
