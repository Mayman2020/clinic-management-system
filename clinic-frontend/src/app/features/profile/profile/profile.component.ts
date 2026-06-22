import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-profile', standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, PageHeaderComponent],
  template: `<div class="page-shell">
    <app-page-header [title]="'PROFILE.TITLE' | translate">
      <a mat-stroked-button routerLink="/admin/dashboard">{{ 'COMMON.CANCEL' | translate }}</a>
    </app-page-header>
    <mat-spinner *ngIf="loading" diameter="40"></mat-spinner>
    <form class="estate-card profile-form" *ngIf="!loading" [formGroup]="form" (ngSubmit)="save()">
      <mat-form-field appearance="outline"><mat-label>{{ 'USERS.USERNAME' | translate }}</mat-label><input matInput [value]="username" disabled></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>{{ 'USERS.FULL_NAME' | translate }}</mat-label><input matInput formControlName="fullName"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label><input matInput formControlName="email"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>{{ 'PATIENTS.PHONE' | translate }}</mat-label><input matInput formControlName="phone"></mat-form-field>
      <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving">{{ 'COMMON.SAVE' | translate }}</button>
    </form>
    <form class="estate-card profile-form" *ngIf="!loading" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
      <h3>{{ 'PROFILE.CHANGE_PASSWORD' | translate }}</h3>
      <mat-form-field appearance="outline"><mat-label>{{ 'PROFILE.CURRENT_PASSWORD' | translate }}</mat-label><input matInput type="password" formControlName="currentPassword"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>{{ 'PROFILE.NEW_PASSWORD' | translate }}</mat-label><input matInput type="password" formControlName="newPassword"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>{{ 'PROFILE.CONFIRM_PASSWORD' | translate }}</mat-label><input matInput type="password" formControlName="confirmPassword"></mat-form-field>
      <button mat-stroked-button type="submit" [disabled]="passwordForm.invalid || changingPassword">{{ 'PROFILE.CHANGE_PASSWORD' | translate }}</button>
    </form>
  </div>`,
  styles: [`.profile-form { display: flex; flex-direction: column; gap: 12px; max-width: 480px; margin-bottom: 16px; } h3 { margin: 0 0 8px; }`]
})
export class ProfileComponent implements OnInit {
  loading = true;
  saving = false;
  changingPassword = false;
  username = '';
  form = this.fb.group({ fullName: ['', Validators.required], email: ['', Validators.email], phone: [''] });
  passwordForm = this.fb.group({ currentPassword: ['', Validators.required], newPassword: ['', [Validators.required, Validators.minLength(6)]], confirmPassword: ['', Validators.required] });

  constructor(
    private readonly fb: FormBuilder,
    private readonly profile: UserProfileService,
    private readonly auth: AuthService,
    private readonly snack: SnackService
  ) {}

  ngOnInit(): void {
    this.profile.getMyProfile().subscribe({
      next: (r) => {
        const u = r.data;
        this.username = u?.username ?? '';
        this.form.patchValue({ fullName: u?.fullName ?? '', email: u?.email ?? '', phone: u?.phone ?? '' });
        this.loading = false;
      },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.getRawValue();
    this.profile.updateMyProfile({ fullName: v.fullName ?? undefined, email: v.email ?? undefined, phone: v.phone ?? undefined }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.saving = false; },
      error: (e) => { this.snack.error(e.message); this.saving = false; }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const v = this.passwordForm.getRawValue();
    if (v.newPassword !== v.confirmPassword) { this.snack.error('PROFILE.PASSWORD_MISMATCH'); return; }
    this.changingPassword = true;
    this.profile.changeMyPassword({ currentPassword: v.currentPassword!, newPassword: v.newPassword! }).subscribe({
      next: () => { this.snack.success('PROFILE.PASSWORD_CHANGED'); this.passwordForm.reset(); this.changingPassword = false; },
      error: (e) => { this.snack.error(e.message); this.changingPassword = false; }
    });
  }
}
