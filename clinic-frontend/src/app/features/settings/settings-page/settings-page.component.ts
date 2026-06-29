import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  { key: 'clinic_email', value: '' },
  { key: 'lab_default_fee', value: '150' },
  { key: 'radiology_default_fee', value: '300' },
  { key: 'multi_branch_enabled', value: 'false' },
  { key: 'sms_enabled', value: 'false' },
  { key: 'sms_provider', value: 'none' },
  { key: 'sms_twilio_account_sid', value: '' },
  { key: 'sms_twilio_auth_token', value: '' },
  { key: 'sms_twilio_from_number', value: '' },
  { key: 'sms_http_url', value: '' },
  { key: 'sms_http_api_key', value: '' }
];

const SETTING_LABELS: Record<string, string> = {
  clinic_name: 'SETTINGS.CLINIC_NAME',
  clinic_phone: 'SETTINGS.CLINIC_PHONE',
  clinic_address: 'SETTINGS.CLINIC_ADDRESS',
  clinic_email: 'SETTINGS.CLINIC_EMAIL',
  lab_default_fee: 'SETTINGS.LAB_DEFAULT_FEE',
  radiology_default_fee: 'SETTINGS.RADIOLOGY_DEFAULT_FEE',
  multi_branch_enabled: 'SETTINGS.MULTI_BRANCH',
  sms_enabled: 'SETTINGS.SMS_ENABLED',
  sms_provider: 'SETTINGS.SMS_PROVIDER',
  sms_twilio_account_sid: 'SETTINGS.SMS_TWILIO_SID',
  sms_twilio_auth_token: 'SETTINGS.SMS_TWILIO_TOKEN',
  sms_twilio_from_number: 'SETTINGS.SMS_TWILIO_FROM',
  sms_http_url: 'SETTINGS.SMS_HTTP_URL',
  sms_http_api_key: 'SETTINGS.SMS_HTTP_KEY'
};

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [NgFor, FormsModule, TranslateModule, MatButtonModule, PageHeaderComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  settings: ClinicSetting[] = [];
  readonly clinicKeys = ['clinic_name', 'clinic_phone', 'clinic_address', 'clinic_email', 'multi_branch_enabled'];
  readonly feeKeys = ['lab_default_fee', 'radiology_default_fee'];
  readonly smsKeys = ['sms_enabled', 'sms_provider', 'sms_twilio_account_sid', 'sms_twilio_auth_token', 'sms_twilio_from_number', 'sms_http_url', 'sms_http_api_key'];

  constructor(
    private readonly svc: SettingsService,
    private readonly snack: SnackService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.svc.getAll().subscribe({
      next: (r) => {
        const loaded = (r.data ?? []).map((s) => ({
          key: s.key ?? (s as { settingKey?: string }).settingKey ?? '',
          value: s.value ?? (s as { settingValue?: string }).settingValue ?? ''
        }));
        const merged = [...DEFAULT_SETTINGS];
        for (const s of loaded) {
          const idx = merged.findIndex((m) => m.key === s.key);
          if (idx >= 0) merged[idx] = s;
          else merged.push(s);
        }
        this.settings = merged;
      },
      error: (e) => { this.snack.error(e.message); this.settings = [...DEFAULT_SETTINGS]; }
    });
  }

  valueFor(key: string): string {
    return this.settings.find(s => s.key === key)?.value ?? '';
  }

  setValue(key: string, value: string): void {
    const item = this.settings.find(s => s.key === key);
    if (item) item.value = value;
    else this.settings.push({ key, value });
  }

  settingLabel(s: ClinicSetting): string {
    const labelKey = SETTING_LABELS[s.key];
    return labelKey ? this.i18n.instant(labelKey) : s.key;
  }

  saveGroup(keys: string[]): void {
    const items = keys.map(key => this.settings.find(s => s.key === key)).filter((s): s is ClinicSetting => !!s);
    let pending = items.length;
    if (!pending) return;
    for (const s of items) {
      this.svc.upsert(s.key, s.value).subscribe({
        next: () => {
          pending--;
          if (pending === 0) this.snack.success('COMMON.SAVED');
        },
        error: (e) => this.snack.error(e.message)
      });
    }
  }
}
