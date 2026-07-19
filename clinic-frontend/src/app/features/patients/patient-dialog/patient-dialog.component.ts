import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PatientService } from '../../../core/services/patient.service';
import { FileService } from '../../../core/services/file.service';
import { InsuranceService } from '../../../core/services/insurance.service';
import { Patient } from '../../../core/models/patient.model';
import { InsuranceProvider } from '../../../core/models/insurance.model';
import { SnackService } from '../../../core/services/snack.service';
import { AuditTrailComponent } from '../../../shared/components/audit-trail/audit-trail.component';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';

interface PatientDocument { id: number; fileName: string; fileUrl: string; documentType: string; }

@Component({
  selector: 'app-patient-dialog', standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, TranslateModule, DateFieldComponent, AuditTrailComponent],
  templateUrl: './patient-dialog.component.html'
})
export class PatientDialogComponent implements OnInit {
  uploading = false;
  documents: PatientDocument[] = [];
  insuranceProviders: InsuranceProvider[] = [];
  auditMeta: Pick<Patient, 'createdAt' | 'updatedAt' | 'createdBy'> = {};
  form = this.fb.group({
    firstName: ['', Validators.required], lastName: ['', Validators.required], phone: [''], email: [''],
    gender: [''], nationalId: [''], dateOfBirth: [''], address: [''], allergies: [''], chronicDiseases: [''], documentUrl: [''],
    insuranceProviderId: [null as number | null], insurancePolicyNo: ['']
  });

  constructor(
    private readonly fb: FormBuilder, private readonly svc: PatientService, private readonly files: FileService,
    private readonly insuranceSvc: InsuranceService,
    private readonly snack: SnackService, private readonly ref: MatDialogRef<PatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Patient> | null
  ) {
    if (data) this.form.patchValue(data);
  }

  ngOnInit(): void {
    this.insuranceSvc.listProviders().subscribe({
      next: (r) => { this.insuranceProviders = r.data ?? []; },
      error: () => { /* optional */ }
    });
    if (this.data?.id) {
      this.svc.getById(this.data.id).subscribe({
        next: (res) => {
          const patient = res.data;
          if (patient) {
            this.auditMeta = {
              createdAt: patient.createdAt,
              updatedAt: patient.updatedAt,
              createdBy: patient.createdBy
            };
          }
        }
      });
      this.svc.getDocuments(this.data.id).subscribe({
        next: (r) => { this.documents = r.data ?? []; },
        error: () => { /* optional */ }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.files.upload(file).subscribe({
      next: (url) => { this.form.patchValue({ documentUrl: url }); this.uploading = false; },
      error: (e) => { this.snack.error(e.message); this.uploading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload: Partial<Patient> = {
      firstName: raw.firstName ?? undefined,
      lastName: raw.lastName ?? undefined,
      phone: raw.phone ?? undefined,
      email: raw.email ?? undefined,
      gender: raw.gender ?? undefined,
      nationalId: raw.nationalId ?? undefined,
      dateOfBirth: raw.dateOfBirth ?? undefined,
      address: raw.address ?? undefined,
      allergies: raw.allergies ?? undefined,
      chronicDiseases: raw.chronicDiseases ?? undefined,
      insuranceProviderId: raw.insuranceProviderId ?? undefined,
      insurancePolicyNo: raw.insurancePolicyNo ?? undefined
    };
    const req = this.data?.id ? this.svc.update(this.data.id, payload) : this.svc.create(payload);
    req.subscribe({
      next: (res) => {
        const patientId = res.data?.id ?? this.data?.id;
        const docUrl = raw.documentUrl;
        if (patientId && docUrl) {
          this.svc.addDocument(patientId, { fileName: 'document', fileUrl: docUrl, documentType: 'OTHER' }).subscribe({ error: () => {} });
        }
        this.snack.success('COMMON.SAVED');
        this.ref.close(true);
      },
      error: (e) => this.snack.error(e.message)
    });
  }
}
