/**
 * Fix feature list components and add layout, login, dashboard, admin routes
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let n = 0;
function w(rel, c) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, c, 'utf8');
  n++;
}

function listComp(opts) {
  const { selector, className, feature, service, model, titleKey, cols, hasCreate = true, loadExtra = '' } = opts;
  const colDefs = cols.map(c => `{ key: '${c.key}', labelKey: '${c.label}' }`).join(', ');
  return `import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ${service} } from '../../../core/services/${feature}.service';
import { ${model} } from '../../../core/models/${feature}.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: '${selector}',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, PageHeaderComponent],
  templateUrl: './${selector.replace('app-', '')}.component.html',
  styleUrl: './${selector.replace('app-', '')}.component.scss'
})
export class ${className} implements OnInit {
  loading = false;
  search = '';
  rows: ${model}[] = [];
  displayedColumns = [${cols.map(c => `'${c.key}'`).join(', ')}, 'actions'];
  columns = [${colDefs}];

  constructor(private readonly svc: ${service}, private readonly snack: SnackService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    ${loadExtra || `this.svc.list(0, 50, this.search).subscribe({
      next: (res) => {
        this.rows = res.data?.content ?? [];
        this.loading = false;
      },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });`}
  }
${hasCreate ? `
  onCreate(): void { this.snack.info('Create dialog — connect when backend is ready'); }
  onEdit(_row: ${model}): void { this.snack.info('Edit dialog — connect when backend is ready'); }
` : ''}
}
`;
}

const lists = [
  { path: 'patients/patient-list', selector: 'app-patient-list', className: 'PatientListComponent', feature: 'patient', service: 'PatientService', model: 'Patient', titleKey: 'PATIENTS', cols: [{ key: 'patientCode', label: 'PATIENTS.CODE' }, { key: 'firstName', label: 'PATIENTS.NAME' }, { key: 'phone', label: 'PATIENTS.PHONE' }, { key: 'gender', label: 'PATIENTS.GENDER' }] },
  { path: 'doctors/doctor-list', selector: 'app-doctor-list', className: 'DoctorListComponent', feature: 'doctor', service: 'DoctorService', model: 'Doctor', titleKey: 'DOCTORS', cols: [{ key: 'doctorCode', label: 'PATIENTS.CODE' }, { key: 'firstName', label: 'PATIENTS.NAME' }, { key: 'specialty', label: 'DOCTORS.SPECIALTY' }, { key: 'department', label: 'DOCTORS.DEPARTMENT' }] },
  { path: 'appointments/appointment-list', selector: 'app-appointment-list', className: 'AppointmentListComponent', feature: 'appointment', service: 'AppointmentService', model: 'Appointment', titleKey: 'APPOINTMENTS', cols: [{ key: 'appointmentNo', label: 'PATIENTS.CODE' }, { key: 'patientName', label: 'APPOINTMENTS.PATIENT' }, { key: 'doctorName', label: 'APPOINTMENTS.DOCTOR' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { path: 'prescription/prescription-list', selector: 'app-prescription-list', className: 'PrescriptionListComponent', feature: 'prescription', service: 'PrescriptionService', model: 'Prescription', titleKey: 'PRESCRIPTION', cols: [{ key: 'prescriptionNo', label: 'PATIENTS.CODE' }, { key: 'patientId', label: 'APPOINTMENTS.PATIENT' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { path: 'lab/lab-list', selector: 'app-lab-list', className: 'LabListComponent', feature: 'lab', service: 'LabService', model: 'LabRequest', titleKey: 'LAB', cols: [{ key: 'requestNo', label: 'PATIENTS.CODE' }, { key: 'testType', label: 'LAB.TEST_TYPE' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { path: 'radiology/radiology-list', selector: 'app-radiology-list', className: 'RadiologyListComponent', feature: 'radiology', service: 'RadiologyService', model: 'RadiologyRequest', titleKey: 'RADIOLOGY', cols: [{ key: 'requestNo', label: 'PATIENTS.CODE' }, { key: 'studyType', label: 'RADIOLOGY.STUDY_TYPE' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { path: 'billing/billing-list', selector: 'app-billing-list', className: 'BillingListComponent', feature: 'billing', service: 'BillingService', model: 'Invoice', titleKey: 'BILLING', cols: [{ key: 'invoiceNo', label: 'PATIENTS.CODE' }, { key: 'patientName', label: 'APPOINTMENTS.PATIENT' }, { key: 'total', label: 'BILLING.TOTAL' }, { key: 'status', label: 'COMMON.STATUS' }], loadExtra: `this.svc.listInvoices(0, 50).subscribe({
      next: (res) => { this.rows = res.data?.content ?? []; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });` },
  { path: 'insurance/insurance-list', selector: 'app-insurance-list', className: 'InsuranceListComponent', feature: 'insurance', service: 'InsuranceService', model: 'InsuranceClaim', titleKey: 'INSURANCE', cols: [{ key: 'claimNo', label: 'PATIENTS.CODE' }, { key: 'amount', label: 'BILLING.AMOUNT' }, { key: 'status', label: 'COMMON.STATUS' }], loadExtra: `this.svc.listClaims(0, 50).subscribe({
      next: (res) => { this.rows = res.data?.content ?? []; this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });` },
  { path: 'users/user-list', selector: 'app-user-list', className: 'UserListComponent', feature: 'user', service: 'UserService', model: 'User', titleKey: 'USERS', hasCreate: false, cols: [{ key: 'username', label: 'USERS.USERNAME' }, { key: 'email', label: 'AUTH.EMAIL' }, { key: 'role', label: 'USERS.ROLE' }] },
];

lists.forEach((l) => {
  w(`clinic-frontend/src/app/features/${l.path}/${l.selector.replace('app-', '')}.component.ts`, listComp(l));
});

function listHtml(titleKey, hasCreate = true) {
  return `<div class="page-shell">
  <app-page-header [title]="'${titleKey}.TITLE' | translate">
    ${hasCreate ? `<button mat-flat-button color="primary" type="button" (click)="onCreate()"><span class="material-icons">add</span>{{ '${titleKey}.NEW' | translate }}</button>` : ''}
    <button mat-stroked-button type="button" (click)="load()"><span class="material-icons">refresh</span>{{ 'COMMON.REFRESH' | translate }}</button>
  </app-page-header>
  <div class="estate-card admin-filters">
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>{{ 'COMMON.SEARCH' | translate }}</mat-label>
      <input matInput [(ngModel)]="search" (keyup.enter)="load()">
    </mat-form-field>
    <button mat-flat-button color="primary" (click)="load()">{{ 'COMMON.SEARCH' | translate }}</button>
  </div>
  <div class="estate-card" *ngIf="!loading; else loadingTpl">
    <table mat-table [dataSource]="rows" class="app-data-table">
      <ng-container *ngFor="let col of columns" [matColumnDef]="col.key">
        <th mat-header-cell *matHeaderCellDef>{{ col.labelKey | translate }}</th>
        <td mat-cell *matCellDef="let row">{{ row[col.key] }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>{{ 'COMMON.ACTIONS' | translate }}</th>
        <td mat-cell *matCellDef="let row"><button mat-icon-button type="button" (click)="onEdit(row)" *ngIf="onEdit"><span class="material-icons">edit</span></button></td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>
    <p *ngIf="!rows.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
  </div>
  <ng-template #loadingTpl><mat-spinner diameter="40"></mat-spinner></ng-template>
</div>`;
}

lists.forEach((l) => {
  w(`clinic-frontend/src/app/features/${l.path}/${l.selector.replace('app-', '')}.component.html`, listHtml(l.titleKey, l.hasCreate !== false));
});

// Fix user list html - no NEW key
w('clinic-frontend/src/app/features/users/user-list/user-list.component.html', listHtml('USERS', false));

// LOGIN
w('clinic-frontend/src/app/features/auth/login/login.component.ts', `import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-login', standalone: true,
  imports: [NgIf, ReactiveFormsModule, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  constructor(private readonly fb: FormBuilder, private readonly auth: AuthService, private readonly permissions: PermissionService,
    private readonly router: Router, private readonly snack: SnackService, readonly i18n: I18nService) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
    if (this.auth.isAuthenticated()) void this.router.navigateByUrl(this.auth.getDashboardRoute());
  }

  get emailCtrl() { return this.form.get('email')!; }
  get passwordCtrl() { return this.form.get('password')!; }

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
`);

w('clinic-frontend/src/app/features/auth/login/login.component.html', `<div class="estate-login">
  <section class="estate-login-hero">
    <div class="hero-brand">
      <div class="hero-brand-mark"><span class="material-icons">local_hospital</span></div>
      <div><div class="hero-brand-name">{{ 'APP.NAME' | translate }}</div><div class="hero-brand-sub">Clinic OS</div></div>
    </div>
    <div class="hero-copy">
      <div class="hero-eyebrow">{{ 'INLINE_TEXT.COMMAND_CENTER' | translate }}</div>
      <h1>{{ 'LOGIN.HERO_TITLE_1' | translate }}<br><em>{{ 'LOGIN.HERO_TITLE_2' | translate }}</em></h1>
      <p>{{ 'LOGIN.HERO_SUBTITLE' | translate }}</p>
    </div>
  </section>
  <section class="estate-login-panel">
    <div class="login-shell">
      <div class="login-title">{{ 'AUTH.LOGIN' | translate }}</div>
      <p class="login-subtitle">{{ 'LOGIN.FORM_SUBTITLE' | translate }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
        <label class="field-label">{{ 'AUTH.EMAIL' | translate }}</label>
        <div class="login-field"><span class="material-icons">mail</span><input formControlName="email" type="email"></div>
        <label class="field-label">{{ 'AUTH.PASSWORD' | translate }}</label>
        <div class="login-field">
          <span class="material-icons">lock</span>
          <input formControlName="password" [type]="showPassword ? 'text' : 'password'">
          <button type="button" class="field-icon-btn" (click)="showPassword = !showPassword"><span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span></button>
        </div>
        <div class="login-error" *ngIf="error"><span class="material-icons">error_outline</span>{{ error }}</div>
        <button type="submit" class="login-submit" [disabled]="form.invalid || loading">{{ loading ? ('COMMON.LOADING' | translate) : ('AUTH.ENTER' | translate) }}</button>
      </form>
    </div>
  </section>
</div>`);

w('clinic-frontend/src/app/features/auth/login/login.component.scss', `:host { display: block; }\n`);

console.log('Fixed lists + login:', n);

module.exports = { n };
