import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { ConsultationService } from '../../../core/services/consultation.service';
import { Consultation } from '../../../core/models/consultation.model';
import { SnackService } from '../../../core/services/snack.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { PrescriptionDialogComponent } from '../../prescription/prescription-dialog/prescription-dialog.component';
import { LabDialogComponent } from '../../lab/lab-dialog/lab-dialog.component';
import { RadiologyDialogComponent } from '../../radiology/radiology-dialog/radiology-dialog.component';

@Component({
  selector: 'app-consultation-hub',
  standalone: true,
  imports: [
    NgIf, RouterLink, TranslateModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule, PageHeaderComponent, TranslateKeyPipe, HasPermissionDirective
  ],
  templateUrl: './consultation-hub.component.html',
  styleUrl: './consultation-hub.component.scss'
})
export class ConsultationHubComponent implements OnInit {
  loading = true;
  consultation?: Consultation;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly svc: ConsultationService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService,
    private readonly confirm: ConfirmService
  ) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    if (!id) { void this.router.navigate(['/admin/consultation']); return; }
    this.load(id);
  }

  load(id: number): void {
    this.loading = true;
    this.svc.getById(id).subscribe({
      next: (r) => { this.consultation = r.data; this.loading = false; },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  isActive(): boolean {
    return this.consultation?.status !== 'COMPLETED';
  }

  onPrescription(): void {
    if (!this.consultation) return;
    this.dialogs.open(PrescriptionDialogComponent, {
      width: '520px',
      data: { patientId: this.consultation.patientId, doctorId: this.consultation.doctorId, consultationId: this.consultation.id }
    });
  }

  onLab(): void {
    if (!this.consultation) return;
    this.dialogs.open(LabDialogComponent, {
      width: '520px',
      data: { patientId: this.consultation.patientId, doctorId: this.consultation.doctorId, consultationId: this.consultation.id }
    });
  }

  onRadiology(): void {
    if (!this.consultation) return;
    this.dialogs.open(RadiologyDialogComponent, {
      width: '520px',
      data: { patientId: this.consultation.patientId, doctorId: this.consultation.doctorId, consultationId: this.consultation.id }
    });
  }

  onGenerateInvoice(): void {
    if (!this.consultation) return;
    this.confirm.confirm({ titleKey: 'COMMON.CONFIRM_TITLE', messageKey: 'WORKFLOW.GENERATE_INVOICE_CONFIRM' }).subscribe((ok) => {
      if (!ok) return;
      this.svc.generateInvoice(this.consultation!.id).subscribe({
        next: (res) => {
          this.snack.success('WORKFLOW.INVOICE_CREATED');
          const invId = (res.data as { id?: number })?.id;
          if (invId) void this.router.navigate(['/admin/billing', invId]);
          else void this.router.navigate(['/admin/billing']);
        },
        error: (e) => this.snack.error(e.message)
      });
    });
  }

  onComplete(): void {
    if (!this.consultation) return;
    this.svc.complete(this.consultation.id).subscribe({
      next: () => { this.snack.success('WORKFLOW.CONSULTATION_COMPLETED'); this.load(this.consultation!.id); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
