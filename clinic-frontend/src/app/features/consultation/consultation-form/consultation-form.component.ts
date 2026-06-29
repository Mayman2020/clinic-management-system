import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConsultationService } from '../../../core/services/consultation.service';
import { SnackService } from '../../../core/services/snack.service';
import { PatientSearchFieldComponent } from '../../../shared/components/patient-search-field/patient-search-field.component';
import { DoctorSearchFieldComponent } from '../../../shared/components/doctor-search-field/doctor-search-field.component';

@Component({
  selector: 'app-consultation-form', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, MatFormFieldModule, MatInputModule, MatButtonModule, PageHeaderComponent, PatientSearchFieldComponent, DoctorSearchFieldComponent],
  template: `
    <div class="page-shell form-page">
      <app-page-header [title]="(editId ? 'COMMON.EDIT' : 'CONSULTATION.NEW') | translate">
        <a mat-stroked-button routerLink="/admin/consultation">{{ 'COMMON.CANCEL' | translate }}</a>
      </app-page-header>
      <form class="estate-card form-card" [formGroup]="form" (ngSubmit)="save()">
        <div class="app-card-header">
          <span class="app-card-title">{{ (editId ? 'COMMON.EDIT' : 'CONSULTATION.NEW') | translate }}</span>
        </div>
        <div class="app-card-body emr-form cm-form-dialog">
          <app-patient-search-field formControlName="patientId"></app-patient-search-field>
          <app-doctor-search-field formControlName="doctorId"></app-doctor-search-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.CHIEF_COMPLAINT' | translate }}</mat-label><textarea matInput rows="3" formControlName="symptoms"></textarea></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.DIAGNOSIS' | translate }}</mat-label><textarea matInput rows="3" formControlName="diagnosis"></textarea></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.TREATMENT' | translate }}</mat-label><textarea matInput rows="2" formControlName="treatmentPlan"></textarea></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>{{ 'CONSULTATION.NOTES' | translate }}</mat-label><textarea matInput rows="4" formControlName="notes"></textarea></mat-form-field>
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-card { padding: 0; max-width: 760px; }
    .emr-form { display: flex; flex-direction: column; gap: 8px; }
    .form-actions { display: flex; justify-content: flex-end; padding-top: 8px; }
  `]
})
export class ConsultationFormComponent implements OnInit {
  editId?: number;
  private appointmentId?: number;
  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    doctorId: [null as number | null, Validators.required],
    symptoms: [''],
    diagnosis: [''],
    treatmentPlan: [''],
    notes: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: ConsultationService,
    private readonly snack: SnackService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) this.editId = +idParam;
    const q = this.route.snapshot.queryParamMap;
    const patientId = q.get('patientId');
    const doctorId = q.get('doctorId');
    const appointmentId = q.get('appointmentId');
    if (patientId) this.form.patchValue({ patientId: +patientId });
    if (doctorId) this.form.patchValue({ doctorId: +doctorId });
    if (appointmentId) this.appointmentId = +appointmentId;
    if (this.editId) {
      this.svc.getById(this.editId).subscribe({
        next: (r) => {
          const c = r.data;
          if (!c) return;
          this.form.patchValue({
            patientId: c.patientId,
            doctorId: c.doctorId,
            symptoms: c.symptoms,
            diagnosis: c.diagnosis,
            treatmentPlan: c.treatmentPlan,
            notes: c.notes
          });
          if (c.appointmentId) this.appointmentId = c.appointmentId;
        },
        error: (e) => this.snack.error(e.message)
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      symptoms: v.symptoms ?? undefined,
      diagnosis: v.diagnosis ?? undefined,
      treatmentPlan: v.treatmentPlan ?? undefined,
      notes: v.notes ?? undefined,
      patientId: v.patientId ?? undefined,
      doctorId: v.doctorId ?? undefined,
      appointmentId: this.appointmentId
    };
    const req$ = this.editId ? this.svc.update(this.editId, payload) : this.svc.create(payload);
    req$.subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.router.navigate(['/admin/consultation']); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
