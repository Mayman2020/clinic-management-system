import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SettingsService } from '../../../core/services/settings.service';
import { ClinicSetting } from '../../../core/models/settings.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

const DEFAULT_SETTINGS: ClinicSetting[] = [
  { key: 'clinic_name', value: '' },
  { key: 'clinic_phone', value: '' },
  { key: 'clinic_address', value: '' },
  { key: 'clinic_email', value: '' }
];

const SETTING_LABELS: Record<string, string> = {
  clinic_name: 'SETTINGS.CLINIC_NAME',
  clinic_phone: 'SETTINGS.CLINIC_PHONE',
  clinic_address: 'SETTINGS.CLINIC_ADDRESS',
  clinic_email: 'SETTINGS.CLINIC_EMAIL'
};

@Component({
  selector: 'app-settings-page', standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, PageHeaderComponent],
  template: `<div class="page-shell"><app-page-header [title]="'SETTINGS.TITLE' | translate"></app-page-header>
  <div class="estate-card" *ngFor="let s of settings"><mat-form-field appearance="outline"><mat-label>{{ settingLabel(s) }}</mat-label><input matInput [(ngModel)]="s.value"></mat-form-field>
  <button mat-stroked-button (click)="save(s)">{{ 'COMMON.SAVE' | translate }}</button></div></div>`
})
export class SettingsPageComponent implements OnInit {
  settings: ClinicSetting[] = [];
  constructor(private readonly svc: SettingsService, private readonly snack: SnackService, private readonly i18n: I18nService) {}
  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (r) => {
        const loaded = (r.data ?? []).map((s) => ({
          key: s.key ?? (s as { settingKey?: string }).settingKey ?? '',
          value: s.value ?? (s as { settingValue?: string }).settingValue ?? ''
        }));
        this.settings = loaded.length ? loaded : [...DEFAULT_SETTINGS];
      },
      error: (e) => { this.snack.error(e.message); this.settings = [...DEFAULT_SETTINGS]; }
    });
  }
  settingLabel(s: ClinicSetting): string {
    const labelKey = SETTING_LABELS[s.key];
    return labelKey ? this.i18n.instant(labelKey) : s.key;
  }
  save(s: ClinicSetting): void {
    this.svc.upsert(s.key, s.value).subscribe({ next: () => this.snack.success('COMMON.SAVED'), error: (e) => this.snack.error(e.message) });
  }
}
