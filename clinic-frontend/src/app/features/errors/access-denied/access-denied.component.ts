import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink, MatButtonModule, TranslateModule],
  template: `
    <section class="access-denied-shell">
      <div class="card">
        <span class="material-icons">lock</span>
        <h1>{{ 'ERRORS.ACCESS_DENIED' | translate }}</h1>
        <p>{{ 'ERRORS.ACCESS_DENIED_MESSAGE' | translate }}</p>
        <div class="actions">
          <a mat-stroked-button routerLink="/admin/dashboard">{{ 'NAV.DASHBOARD' | translate }}</a>
          <button mat-flat-button color="primary" type="button" (click)="goHome()">{{ 'AUTH.LOGIN' | translate }}</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .access-denied-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--bg-50); }
    .card { max-width: 480px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); padding: 32px; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; }
    .material-icons { font-size: 56px; color: var(--warning-500); }
    h1 { margin: 0; font-size: 1.35rem; color: var(--ink-800); }
    p { margin: 0; color: var(--ink-500); line-height: 1.6; }
    .actions { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
  `]
})
export class AccessDeniedComponent {
  constructor(private readonly auth: AuthService) {}

  goHome(): void {
    if (this.auth.isAuthenticated()) {
      void this.auth.logout();
      return;
    }
    window.location.assign('/auth/login');
  }
}
