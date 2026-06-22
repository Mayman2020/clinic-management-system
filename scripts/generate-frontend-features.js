/**
 * Generates domain services, layout, login, features, admin routes
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let count = 0;
function w(rel, c) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, c, 'utf8');
  count++;
}

// Domain services template helper
function svc(name, model, basePath, extra = '') {
  return `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { ${model} } from '../models/${name.toLowerCase()}.model';

@Injectable({ providedIn: 'root' })
export class ${name}Service {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, search = ''): Observable<ApiResponse<PagedResponse<${model}>>> {
    const params: Record<string, string | number> = { page, size };
    if (search) params['search'] = search;
    return this.api.get<ApiResponse<PagedResponse<${model}>>>(AppConstants.API.${basePath}, params);
  }
  getById(id: number): Observable<ApiResponse<${model}>> {
    return this.api.get<ApiResponse<${model}>>(AppConstants.API.${basePath.replace(/S$/, '')}_BY_ID(id));
  }
  create(payload: Partial<${model}>): Observable<ApiResponse<${model}>> {
    return this.api.post<ApiResponse<${model}>>(AppConstants.API.${basePath}, payload);
  }
  update(id: number, payload: Partial<${model}>): Observable<ApiResponse<${model}>> {
    return this.api.put<ApiResponse<${model}>>(AppConstants.API.${basePath.replace(/S$/, '')}_BY_ID(id), payload);
  }
  delete(id: number): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(AppConstants.API.${basePath.replace(/S$/, '')}_BY_ID(id));
  }
${extra}
}
`;
}

w('clinic-frontend/src/app/core/services/patient.service.ts', svc('Patient', 'Patient', 'PATIENTS', `  search(q: string): Observable<ApiResponse<Patient[]>> {
    return this.api.get<ApiResponse<Patient[]>>(AppConstants.API.PATIENT_SEARCH, { q });
  }
`));

w('clinic-frontend/src/app/core/services/doctor.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Doctor, DoctorSchedule } from '../models/doctor.model';
@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, search = ''): Observable<ApiResponse<PagedResponse<Doctor>>> {
    const params: Record<string, string | number> = { page, size };
    if (search) params['search'] = search;
    return this.api.get<ApiResponse<PagedResponse<Doctor>>>(AppConstants.API.DOCTORS, params);
  }
  getById(id: number): Observable<ApiResponse<Doctor>> { return this.api.get<ApiResponse<Doctor>>(AppConstants.API.DOCTOR_BY_ID(id)); }
  getSchedules(doctorId: number): Observable<ApiResponse<DoctorSchedule[]>> { return this.api.get<ApiResponse<DoctorSchedule[]>>(AppConstants.API.DOCTOR_SCHEDULES(doctorId)); }
  saveSchedule(doctorId: number, payload: Partial<DoctorSchedule>): Observable<ApiResponse<DoctorSchedule>> {
    return this.api.post<ApiResponse<DoctorSchedule>>(AppConstants.API.DOCTOR_SCHEDULES(doctorId), payload);
  }
}
`);

w('clinic-frontend/src/app/core/services/appointment.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Appointment } from '../models/appointment.model';
@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20, params: Record<string, string | number> = {}): Observable<ApiResponse<PagedResponse<Appointment>>> {
    return this.api.get<ApiResponse<PagedResponse<Appointment>>>(AppConstants.API.APPOINTMENTS, { page, size, ...params });
  }
  getCalendar(from: string, to: string): Observable<ApiResponse<Appointment[]>> {
    return this.api.get<ApiResponse<Appointment[]>>(AppConstants.API.APPOINTMENTS_CALENDAR, { from, to });
  }
  book(payload: Partial<Appointment>): Observable<ApiResponse<Appointment>> { return this.api.post<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENTS_BOOK, payload); }
  updateStatus(id: number, status: string): Observable<ApiResponse<Appointment>> { return this.api.patch<ApiResponse<Appointment>>(AppConstants.API.APPOINTMENT_STATUS(id), { status }); }
}
`);

w('clinic-frontend/src/app/core/services/queue.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { QueueToken } from '../models/queue.model';
@Injectable({ providedIn: 'root' })
export class QueueService {
  constructor(private readonly api: ApiService) {}
  getToday(doctorId?: number): Observable<ApiResponse<QueueToken[]>> {
    return this.api.get<ApiResponse<QueueToken[]>>(AppConstants.API.QUEUE_TODAY, doctorId ? { doctorId } : undefined);
  }
  callNext(doctorId?: number): Observable<ApiResponse<QueueToken>> {
    return this.api.post<ApiResponse<QueueToken>>(AppConstants.API.QUEUE_CALL_NEXT, { doctorId });
  }
  updateStatus(id: number, status: string): Observable<ApiResponse<QueueToken>> {
    return this.api.patch<ApiResponse<QueueToken>>(AppConstants.API.QUEUE_TOKEN_STATUS(id), { status });
  }
  getTvDisplay(): Observable<ApiResponse<QueueToken[]>> { return this.api.get<ApiResponse<QueueToken[]>>(AppConstants.API.QUEUE_TV_DISPLAY); }
}
`);

w('clinic-frontend/src/app/core/services/consultation.service.ts', svc('Consultation', 'Consultation', 'CONSULTATIONS', `  getByAppointment(appointmentId: number): Observable<ApiResponse<Consultation>> {
    return this.api.get<ApiResponse<Consultation>>(AppConstants.API.CONSULTATIONS_BY_APPOINTMENT(appointmentId));
  }
`));

w('clinic-frontend/src/app/core/services/prescription.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Prescription } from '../models/prescription.model';
@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20): Observable<ApiResponse<PagedResponse<Prescription>>> {
    return this.api.get<ApiResponse<PagedResponse<Prescription>>>(AppConstants.API.PRESCRIPTIONS, { page, size });
  }
  create(payload: Partial<Prescription>): Observable<ApiResponse<Prescription>> { return this.api.post<ApiResponse<Prescription>>(AppConstants.API.PRESCRIPTIONS, payload); }
  getPrint(id: number): Observable<ApiResponse<Prescription>> { return this.api.get<ApiResponse<Prescription>>(AppConstants.API.PRESCRIPTION_PRINT(id)); }
}
`);

w('clinic-frontend/src/app/core/services/lab.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { LabRequest } from '../models/lab.model';
@Injectable({ providedIn: 'root' })
export class LabService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20): Observable<ApiResponse<PagedResponse<LabRequest>>> {
    return this.api.get<ApiResponse<PagedResponse<LabRequest>>>(AppConstants.API.LAB_REQUESTS, { page, size });
  }
  updateStatus(id: number, status: string): Observable<ApiResponse<LabRequest>> {
    return this.api.patch<ApiResponse<LabRequest>>(AppConstants.API.LAB_REQUEST_STATUS(id), { status });
  }
}
`);

w('clinic-frontend/src/app/core/services/radiology.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { RadiologyRequest } from '../models/radiology.model';
@Injectable({ providedIn: 'root' })
export class RadiologyService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20): Observable<ApiResponse<PagedResponse<RadiologyRequest>>> {
    return this.api.get<ApiResponse<PagedResponse<RadiologyRequest>>>(AppConstants.API.RADIOLOGY_REQUESTS, { page, size });
  }
  updateStatus(id: number, status: string): Observable<ApiResponse<RadiologyRequest>> {
    return this.api.patch<ApiResponse<RadiologyRequest>>(AppConstants.API.RADIOLOGY_REQUEST_STATUS(id), { status });
  }
}
`);

w('clinic-frontend/src/app/core/services/billing.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { Invoice, Payment } from '../models/billing.model';
@Injectable({ providedIn: 'root' })
export class BillingService {
  constructor(private readonly api: ApiService) {}
  listInvoices(page = 0, size = 20): Observable<ApiResponse<PagedResponse<Invoice>>> {
    return this.api.get<ApiResponse<PagedResponse<Invoice>>>(AppConstants.API.INVOICES, { page, size });
  }
  listPayments(page = 0, size = 20): Observable<ApiResponse<PagedResponse<Payment>>> {
    return this.api.get<ApiResponse<PagedResponse<Payment>>>(AppConstants.API.PAYMENTS, { page, size });
  }
  recordPayment(invoiceId: number, payload: Partial<Payment>): Observable<ApiResponse<Payment>> {
    return this.api.post<ApiResponse<Payment>>(AppConstants.API.PAYMENTS_BY_INVOICE(invoiceId), payload);
  }
}
`);

w('clinic-frontend/src/app/core/services/insurance.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { InsuranceClaim, InsuranceProvider } from '../models/insurance.model';
@Injectable({ providedIn: 'root' })
export class InsuranceService {
  constructor(private readonly api: ApiService) {}
  listProviders(): Observable<ApiResponse<InsuranceProvider[]>> { return this.api.get<ApiResponse<InsuranceProvider[]>>(AppConstants.API.INSURANCE_PROVIDERS); }
  listClaims(page = 0, size = 20): Observable<ApiResponse<PagedResponse<InsuranceClaim>>> {
    return this.api.get<ApiResponse<PagedResponse<InsuranceClaim>>>(AppConstants.API.INSURANCE_CLAIMS, { page, size });
  }
}
`);

w('clinic-frontend/src/app/core/services/dashboard.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { ChartPoint, DashboardStats } from '../models/dashboard.model';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}
  getStats(): Observable<ApiResponse<DashboardStats>> { return this.api.get<ApiResponse<DashboardStats>>(AppConstants.API.DASHBOARD_STATS); }
  getRevenueChart(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.DASHBOARD_REVENUE); }
  getAppointmentsChart(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.DASHBOARD_APPOINTMENTS); }
}
`);

w('clinic-frontend/src/app/core/services/report.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { ChartPoint } from '../models/dashboard.model';
@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private readonly api: ApiService) {}
  appointments(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_APPOINTMENTS); }
  revenue(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_REVENUE); }
  patients(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_PATIENTS); }
  doctors(): Observable<ApiResponse<ChartPoint[]>> { return this.api.get<ApiResponse<ChartPoint[]>>(AppConstants.API.REPORTS_DOCTORS); }
}
`);

w('clinic-frontend/src/app/core/services/settings.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';
import { ClinicSetting } from '../models/settings.model';
@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private readonly api: ApiService) {}
  getAll(): Observable<ApiResponse<ClinicSetting[]>> { return this.api.get<ApiResponse<ClinicSetting[]>>(AppConstants.API.SETTINGS); }
  update(key: string, value: string): Observable<ApiResponse<ClinicSetting>> {
    return this.api.put<ApiResponse<ClinicSetting>>(AppConstants.API.SETTINGS_BY_KEY(key), { value });
  }
}
`);

w('clinic-frontend/src/app/core/services/user.service.ts', `import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly api: ApiService) {}
  list(page = 0, size = 20): Observable<ApiResponse<PagedResponse<User>>> {
    return this.api.get<ApiResponse<PagedResponse<User>>>(AppConstants.API.USERS, { page, size });
  }
}
`);

// Generic list page component generator
function listPage(feature, titleKey, svcName, model, columns, extraImports = '', extraClass = '') {
  const cols = columns.map(c => `{ key: '${c.key}', labelKey: '${c.label}' }`).join(', ');
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
import { ${svcName} } from '../../../core/services/${feature}.service';
import { ${model} } from '../../../core/models/${feature}.model';
import { SnackService } from '../../../core/services/snack.service';
${extraImports}
@Component({
  selector: 'app-${feature}-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, MatTableModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule, PageHeaderComponent],
  templateUrl: './${feature}-list.component.html',
  styleUrl: './${feature}-list.component.scss'
})
export class ${model}ListComponent implements OnInit {
  loading = false;
  search = '';
  rows: ${model}[] = [];
  displayedColumns = [${columns.map(c => `'${c.key}'`).join(', ')}, 'actions'];
  columns = [${cols}];
  ${extraClass}
  constructor(private readonly svc: ${svcName}, private readonly snack: SnackService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.svc.list(0, 50, this.search).subscribe({
      next: (res) => { this.rows = res.data?.content ?? (Array.isArray(res.data) ? res.data as ${model}[] : []); this.loading = false; },
      error: (err) => { this.snack.error(err.message); this.loading = false; }
    });
  }
}
`;
}

function listHtml(titleKey, hasCreate = true) {
  return `<div class="page-shell">
  <app-page-header [title]="'${titleKey}.TITLE' | translate">
    ${hasCreate ? `<button mat-flat-button color="primary" type="button" (click)="onCreate()" *ngIf="onCreate"><span class="material-icons">add</span>{{ '${titleKey}.NEW' | translate }}</button>` : ''}
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
        <td mat-cell *matCellDef="let row"><button mat-icon-button type="button" (click)="onEdit?.(row)"><span class="material-icons">edit</span></button></td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>
    <p *ngIf="!rows.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
  </div>
  <ng-template #loadingTpl><mat-spinner diameter="40"></mat-spinner></ng-template>
</div>`;
}

// Feature pages
const features = [
  { dir: 'patients', model: 'Patient', svc: 'PatientService', title: 'PATIENTS', cols: [{ key: 'patientCode', label: 'PATIENTS.CODE' }, { key: 'firstName', label: 'PATIENTS.NAME' }, { key: 'phone', label: 'PATIENTS.PHONE' }, { key: 'gender', label: 'PATIENTS.GENDER' }] },
  { dir: 'doctors', model: 'Doctor', svc: 'DoctorService', title: 'DOCTORS', cols: [{ key: 'doctorCode', label: 'PATIENTS.CODE' }, { key: 'firstName', label: 'PATIENTS.NAME' }, { key: 'specialty', label: 'DOCTORS.SPECIALTY' }, { key: 'department', label: 'DOCTORS.DEPARTMENT' }] },
  { dir: 'appointments', model: 'Appointment', svc: 'AppointmentService', title: 'APPOINTMENTS', cols: [{ key: 'appointmentNo', label: 'PATIENTS.CODE' }, { key: 'patientName', label: 'APPOINTMENTS.PATIENT' }, { key: 'doctorName', label: 'APPOINTMENTS.DOCTOR' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { dir: 'prescription', model: 'Prescription', svc: 'PrescriptionService', title: 'PRESCRIPTION', cols: [{ key: 'prescriptionNo', label: 'PATIENTS.CODE' }, { key: 'patientId', label: 'APPOINTMENTS.PATIENT' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { dir: 'lab', model: 'LabRequest', svc: 'LabService', title: 'LAB', cols: [{ key: 'requestNo', label: 'PATIENTS.CODE' }, { key: 'testType', label: 'LAB.TEST_TYPE' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { dir: 'radiology', model: 'RadiologyRequest', svc: 'RadiologyService', title: 'RADIOLOGY', cols: [{ key: 'requestNo', label: 'PATIENTS.CODE' }, { key: 'studyType', label: 'RADIOLOGY.STUDY_TYPE' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { dir: 'billing', model: 'Invoice', svc: 'BillingService', title: 'BILLING', cols: [{ key: 'invoiceNo', label: 'PATIENTS.CODE' }, { key: 'patientName', label: 'APPOINTMENTS.PATIENT' }, { key: 'total', label: 'BILLING.TOTAL' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { dir: 'insurance', model: 'InsuranceClaim', svc: 'InsuranceService', title: 'INSURANCE', cols: [{ key: 'claimNo', label: 'PATIENTS.CODE' }, { key: 'amount', label: 'BILLING.AMOUNT' }, { key: 'status', label: 'COMMON.STATUS' }] },
  { dir: 'users', model: 'User', svc: 'UserService', title: 'USERS', cols: [{ key: 'username', label: 'USERS.USERNAME' }, { key: 'email', label: 'AUTH.EMAIL' }, { key: 'role', label: 'USERS.ROLE' }], hasCreate: false },
];

features.forEach((f) => {
  const compName = f.model === 'User' ? 'user-list' : `${f.dir.replace(/s$/, '')}-list`;
  const className = f.model === 'User' ? 'UserListComponent' : `${f.model}ListComponent`;
  const svcImport = f.model === 'User' ? 'User' : f.model;
  w(`clinic-frontend/src/app/features/${f.dir}/${compName}/${compName}.component.ts`, listPage(f.dir.replace(/s$/, ''), f.title, f.svc.replace('Service', ''), svcImport === 'User' ? 'user' : f.dir.replace(/s$/, ''), f.cols).replace(`${svcImport}ListComponent`, className).replace('PatientService', f.svc).replace('DoctorService', f.svc).replace('AppointmentService', f.svc).replace('PrescriptionService', f.svc).replace('LabService', f.svc).replace('RadiologyService', f.svc).replace('BillingService', f.svc).replace('InsuranceService', f.svc).replace('UserService', f.svc));
  w(`clinic-frontend/src/app/features/${f.dir}/${compName}/${compName}.component.html`, listHtml(f.title, f.hasCreate !== false));
  w(`clinic-frontend/src/app/features/${f.dir}/${compName}/${compName}.component.scss`, `:host { display: block; }\n`);
});

console.log('Services + list pages:', count);
module.exports = { count: () => count };
