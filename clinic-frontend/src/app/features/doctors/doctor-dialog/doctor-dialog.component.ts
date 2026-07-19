import { Component, Inject, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { APP_DIALOG_IMPORTS } from '../../../shared/dialog-ui';
import { LookupSelectComponent } from '../../../shared/components/lookup-select/lookup-select.component';
import { SearchableSelectComponent } from '../../../shared/components/searchable-select/searchable-select.component';
import { AuditTrailComponent } from '../../../shared/components/audit-trail/audit-trail.component';
import { DoctorService } from '../../../core/services/doctor.service';
import { LookupItem, LookupService } from '../../../core/services/lookup.service';
import { Doctor } from '../../../core/models/doctor.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-doctor-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule,
    LookupSelectComponent, SearchableSelectComponent, AuditTrailComponent, ...APP_DIALOG_IMPORTS
  ],
  template: `
    <h2 mat-dialog-title>
      <span class="material-icons dialog-title-icon">medical_services</span>
      {{ (data?.id ? 'COMMON.EDIT' : 'DOCTORS.NEW') | translate }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">
        <div class="rms-dialog-form cm-form-dialog">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ 'DOCTORS.NAME' | translate }}</mat-label>
            <input matInput formControlName="firstName" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ 'DOCTORS.LAST_NAME' | translate }}</mat-label>
            <input matInput formControlName="lastName" />
          </mat-form-field>
          <app-searchable-select
            class="full"
            label="DOCTORS.SPECIALTY"
            formControlName="specialty"
            [items]="specialtyItems"
            bindValue="code"
            [required]="true">
          </app-searchable-select>
          <app-lookup-select lookupType="DEPARTMENT" labelKey="DOCTORS.DEPARTMENT" formControlName="department"></app-lookup-select>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ 'PATIENTS.PHONE' | translate }}</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ 'DOCTORS.FEE' | translate }}</mat-label>
            <input matInput type="number" formControlName="consultationFee" />
          </mat-form-field>
          <app-audit-trail
            *ngIf="data?.id"
            class="full"
            [createdAt]="auditMeta.createdAt"
            [updatedAt]="auditMeta.updatedAt">
          </app-audit-trail>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="app-dialog-actions">
        <button mat-stroked-button type="button" mat-dialog-close class="btn-dialog-cancel">{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button type="submit" class="btn-dialog-confirm" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full { grid-column: 1 / -1; }
  `]
})
export class DoctorDialogComponent implements OnInit {
  specialtyItems: LookupItem[] = [];
  auditMeta: Pick<Doctor, 'createdAt' | 'updatedAt'> = {};

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    specialty: ['', Validators.required],
    department: [''],
    phone: [''],
    consultationFee: [null as number | null]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: DoctorService,
    private readonly lookupSvc: LookupService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<DoctorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Doctor> | null
  ) {}

  ngOnInit(): void {
    this.lookupSvc.getByType('SPECIALTY').subscribe({
      next: (res) => { this.specialtyItems = res.data ?? []; }
    });
    if (this.data) this.form.patchValue(this.data);
    if (this.data?.id) {
      this.svc.getById(this.data.id).subscribe({
        next: (res) => {
          const doctor = res.data;
          if (doctor) {
            this.auditMeta = {
              createdAt: doctor.createdAt,
              updatedAt: doctor.updatedAt
            };
          }
        }
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue() as Partial<Doctor>;
    const req = this.data?.id ? this.svc.update(this.data.id, payload) : this.svc.create(payload);
    req.subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
