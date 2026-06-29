import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { APP_DIALOG_IMPORTS } from '../../../shared/dialog-ui';
import { LookupSelectComponent } from '../../../shared/components/lookup-select/lookup-select.component';
import { RadiologyService } from '../../../core/services/radiology.service';
import { SnackService } from '../../../core/services/snack.service';
import { PatientSearchFieldComponent } from '../../../shared/components/patient-search-field/patient-search-field.component';
import { DoctorSearchFieldComponent } from '../../../shared/components/doctor-search-field/doctor-search-field.component';

export interface RadiologyDialogData {
  patientId?: number;
  doctorId?: number;
  consultationId?: number;
}

@Component({
  selector: 'app-radiology-dialog', standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule,
    PatientSearchFieldComponent, DoctorSearchFieldComponent, LookupSelectComponent, ...APP_DIALOG_IMPORTS
  ],
  template: `
    <h2 mat-dialog-title>
      <span class="material-icons dialog-title-icon">biotech</span>
      {{ 'RADIOLOGY.NEW' | translate }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-body">
        <div class="rms-dialog-form cm-form-dialog">
          <app-patient-search-field class="full" formControlName="patientId"></app-patient-search-field>
          <app-doctor-search-field class="full" formControlName="doctorId"></app-doctor-search-field>
          <app-lookup-select class="full" lookupType="RADIOLOGY_STUDY_TYPE" labelKey="RADIOLOGY.STUDY_TYPE" formControlName="studyType" [required]="true"></app-lookup-select>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="app-dialog-actions">
        <button mat-stroked-button type="button" mat-dialog-close class="btn-dialog-cancel">{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button type="submit" class="btn-dialog-confirm" [disabled]="form.invalid">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `
})
export class RadiologyDialogComponent {
  private consultationId?: number;
  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    doctorId: [null as number | null],
    studyType: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: RadiologyService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<RadiologyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: RadiologyDialogData | null
  ) {
    if (data) {
      this.form.patchValue({ patientId: data.patientId ?? null, doctorId: data.doctorId ?? null });
      this.consultationId = data.consultationId;
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.create({
      patientId: v.patientId!,
      doctorId: v.doctorId ?? undefined,
      consultationId: this.consultationId,
      studyType: v.studyType!
    }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
