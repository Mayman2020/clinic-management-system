import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  loading = true;
  saving = false;
  changingPassword = false;
  highlightPassword = false;
  username = '';
  form = this.fb.group({ fullName: ['', Validators.required], email: ['', Validators.email], phone: [''] });
  passwordForm = this.fb.group({ currentPassword: ['', Validators.required], newPassword: ['', [Validators.required, Validators.minLength(6)]], confirmPassword: ['', Validators.required] });

  constructor(
    private readonly fb: FormBuilder,
    private readonly profile: UserProfileService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('changePassword') === '1') {
      this.highlightPassword = true;
    }
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
      next: (res) => {
        if (res.data) this.auth.applyLoginResponse(res.data);
        this.highlightPassword = false;
        this.snack.success('PROFILE.PASSWORD_CHANGED');
        this.passwordForm.reset();
        this.changingPassword = false;
      },
      error: (e) => { this.snack.error(e.message); this.changingPassword = false; }
    });
  }
}
