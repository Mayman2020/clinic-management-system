import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { Patient } from '../../../core/models/patient.model';
import { Doctor } from '../../../core/models/doctor.model';
import { SnackService } from '../../../core/services/snack.service';

@Component({
  selector: 'app-consultation-form', standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, RouterLink, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, PageHeaderComponent],
  template: `<div class="page-shell"><app-page-header [title]="(editId ? 'COMMON.EDIT' : 'CONSULTATION.NEW') | translate">
    <a mat-stroked-button routerLink="/admin/consultation">{{ 'COMMON.CANCEL' | translate }}</a>
  </app-page-header>
  <form class="estate-card emr-form" [formGroup]="form" (ngSubmit)="save()">
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.SELECT_PATIENT' | translate }}</mat-label>
      <mat-select formControlName="patientId">
        <mat-option *ngFor="let p of patients" [value]="p.id">{{ p.patientCode }} — {{ p.firstName }} {{ p.lastName }}</mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.SELECT_DOCTOR' | translate }}</mat-label>
      <mat-select formControlName="doctorId">
        <mat-option *ngFor="let d of doctors" [value]="d.id">{{ d.doctorCode }} — {{ d.firstName }} {{ d.lastName }}</mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.CHIEF_COMPLAINT' | translate }}</mat-label><textarea matInput rows="3" formControlName="symptoms"></textarea></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.DIAGNOSIS' | translate }}</mat-label><textarea matInput rows="3" formControlName="diagnosis"></textarea></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.NOTES' | translate }}</mat-label><textarea matInput rows="4" formControlName="notes"></textarea></mat-form-field>
    <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
  </form></div>`,
  styles: [`.emr-form { display: flex; flex-direction: column; gap: 12px; max-width: 720px; }`]
})
export class ConsultationFormComponent implements OnInit {
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  editId?: number;
  form = this.fb.group({ patientId: [null as number | null], doctorId: [null as number | null], symptoms: [''], diagnosis: [''], notes: [''] });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: ConsultationService,
    private readonly patientSvc: PatientService,
    private readonly doctorSvc: DoctorService,
    private readonly snack: SnackService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) this.editId = +idParam;
    this.patientSvc.list(0, 100).subscribe({ next: (r) => this.patients = r.data?.content ?? [], error: (e) => this.snack.error(e.message) });
    this.doctorSvc.list(0, 100).subscribe({ next: (r) => this.doctors = r.data?.content ?? [], error: (e) => this.snack.error(e.message) });
    if (this.editId) {
      this.svc.getById(this.editId).subscribe({
        next: (r) => {
          const c = r.data;
          if (!c) return;
          this.form.patchValue({ patientId: c.patientId, doctorId: c.doctorId, symptoms: c.symptoms, diagnosis: c.diagnosis, notes: c.notes });
        },
        error: (e) => this.snack.error(e.message)
      });
    }
  }

  save(): void {
    const v = this.form.getRawValue();
    const payload = { symptoms: v.symptoms ?? undefined, diagnosis: v.diagnosis ?? undefined, notes: v.notes ?? undefined, patientId: v.patientId ?? undefined, doctorId: v.doctorId ?? undefined };
    const req$ = this.editId ? this.svc.update(this.editId, payload) : this.svc.create(payload);
    req$.subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.router.navigate(['/admin/consultation']); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
