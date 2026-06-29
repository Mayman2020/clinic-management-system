import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { SnackService } from '../../../core/services/snack.service';
import { PatientSearchFieldComponent } from '../../../shared/components/patient-search-field/patient-search-field.component';
import { DoctorSearchFieldComponent } from '../../../shared/components/doctor-search-field/doctor-search-field.component';

export interface PrescriptionDialogData {
  patientId?: number;
  doctorId?: number;
  consultationId?: number;
}

@Component({
  selector: 'app-prescription-dialog', standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule, PatientSearchFieldComponent, DoctorSearchFieldComponent],
  template: `
    <h2 mat-dialog-title>{{ 'PRESCRIPTION.NEW' | translate }}</h2>
    <form class="cm-form-dialog" [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <app-patient-search-field formControlName="patientId"></app-patient-search-field>
        <app-doctor-search-field formControlName="doctorId"></app-doctor-search-field>
        <div formArrayName="items" class="items-block">
          <div class="item-row" *ngFor="let item of items.controls; let i = index" [formGroupName]="i">
            <mat-form-field appearance="outline"><mat-label>{{ 'PRESCRIPTION.MEDICINE' | translate }}</mat-label><input matInput formControlName="medicineName"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>{{ 'PRESCRIPTION.DOSAGE' | translate }}</mat-label><input matInput formControlName="dosage"></mat-form-field>
            <button mat-icon-button type="button" *ngIf="items.length > 1" (click)="removeItem(i)"><span class="material-icons">remove_circle</span></button>
          </div>
        </div>
        <button mat-stroked-button type="button" (click)="addItem()"><span class="material-icons">add</span>{{ 'PRESCRIPTION.ADD_ITEM' | translate }}</button>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'COMMON.CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .items-block { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .item-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: start; }
  `]
})
export class PrescriptionDialogComponent {
  private consultationId?: number;
  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    doctorId: [null as number | null, Validators.required],
    items: this.fb.array([this.newItemGroup()])
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly svc: PrescriptionService,
    private readonly snack: SnackService,
    private readonly ref: MatDialogRef<PrescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: PrescriptionDialogData | null
  ) {
    if (data) {
      this.form.patchValue({ patientId: data.patientId ?? null, doctorId: data.doctorId ?? null });
      this.consultationId = data.consultationId;
    }
  }

  get items(): FormArray { return this.form.get('items') as FormArray; }

  newItemGroup() {
    return this.fb.group({
      medicineName: ['', Validators.required],
      dosage: ['']
    });
  }

  addItem(): void { this.items.push(this.newItemGroup()); }

  removeItem(index: number): void { this.items.removeAt(index); }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.svc.create({
      patientId: v.patientId!,
      doctorId: v.doctorId!,
      consultationId: this.consultationId,
      items: (v.items ?? []).map((item) => ({
        medicineName: item.medicineName!,
        dosage: item.dosage ?? undefined
      }))
    }).subscribe({
      next: () => { this.snack.success('COMMON.SAVED'); this.ref.close(true); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
