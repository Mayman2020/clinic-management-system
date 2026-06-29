import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { PatientService } from '../../../core/services/patient.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { LabService } from '../../../core/services/lab.service';
import { RadiologyService } from '../../../core/services/radiology.service';
import { BillingService } from '../../../core/services/billing.service';
import { InsuranceService } from '../../../core/services/insurance.service';
import { SnackService } from '../../../core/services/snack.service';
import { Patient } from '../../../core/models/patient.model';
import { Consultation } from '../../../core/models/consultation.model';
import { Appointment } from '../../../core/models/appointment.model';
import { LabRequest } from '../../../core/models/lab.model';
import { RadiologyRequest } from '../../../core/models/radiology.model';
import { Invoice } from '../../../core/models/billing.model';
import { InsuranceClaim } from '../../../core/models/insurance.model';
import { AppointmentDialogComponent } from '../../appointments/appointment-dialog/appointment-dialog.component';
import { InvoiceDialogComponent } from '../../billing/invoice-dialog/invoice-dialog.component';
import { CheckInResultDialogComponent } from '../../appointments/check-in-result-dialog/check-in-result-dialog.component';
import { QueueToken } from '../../../core/models/queue.model';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

interface PatientDocument { id: number; fileName: string; fileUrl: string; documentType: string; }

@Component({
  selector: 'app-patient-360',
  standalone: true,
  imports: [
    NgFor, NgIf, DecimalPipe, RouterLink, TranslateModule,
    MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatTooltipModule,
    PageHeaderComponent, TranslateKeyPipe, RmsDatePipe
  ],
  templateUrl: './patient-360.component.html',
  styleUrl: './patient-360.component.scss'
})
export class Patient360Component implements OnInit {
  loading = true;
  patient?: Patient;
  consultations: Consultation[] = [];
  appointments: Appointment[] = [];
  labRequests: LabRequest[] = [];
  radiologyRequests: RadiologyRequest[] = [];
  invoices: Invoice[] = [];
  insuranceClaims: InsuranceClaim[] = [];
  documents: PatientDocument[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientSvc: PatientService,
    private readonly consultationSvc: ConsultationService,
    private readonly appointmentSvc: AppointmentService,
    private readonly labSvc: LabService,
    private readonly radiologySvc: RadiologyService,
    private readonly billingSvc: BillingService,
    private readonly insuranceSvc: InsuranceService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService
  ) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    if (!id) { this.router.navigate(['/admin/patients']); return; }
    this.load(id);
  }

  load(id: number): void {
    this.loading = true;
    forkJoin({
      patient: this.patientSvc.getById(id),
      consultations: this.consultationSvc.getByPatient(id),
      appointments: this.appointmentSvc.getByPatient(id),
      lab: this.labSvc.getByPatient(id),
      radiology: this.radiologySvc.getByPatient(id),
      billing: this.billingSvc.getByPatient(id),
      documents: this.patientSvc.getDocuments(id),
      claims: this.insuranceSvc.listClaims(0, 100)
    }).subscribe({
      next: ({ patient, consultations, appointments, lab, radiology, billing, documents, claims }) => {
        this.patient = patient.data;
        this.consultations = consultations.data ?? [];
        this.appointments = appointments.data ?? [];
        this.labRequests = lab.data ?? [];
        this.radiologyRequests = radiology.data ?? [];
        this.invoices = billing.data?.content ?? [];
        this.documents = documents.data ?? [];
        this.insuranceClaims = (claims.data?.content ?? []).filter((c) => c.patientId === id);
        this.loading = false;
      },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }

  bookAppointment(): void {
    if (!this.patient) return;
    this.dialogs.open(AppointmentDialogComponent, {
      width: '480px',
      data: { mode: 'book', appointment: { patientId: this.patient.id } as Appointment }
    }).afterClosed().subscribe((saved) => { if (saved && this.patient) this.load(this.patient.id); });
  }

  startConsultation(): void {
    if (!this.patient) return;
    this.router.navigate(['/admin/consultation/new'], { queryParams: { patientId: this.patient.id } });
  }

  newInvoice(): void {
    if (!this.patient) return;
    this.dialogs.open(InvoiceDialogComponent, {
      width: '480px',
      data: { patientId: this.patient.id }
    }).afterClosed().subscribe((saved) => { if (saved && this.patient) this.load(this.patient.id); });
  }

  onCheckIn(a: Appointment): void {
    this.appointmentSvc.checkIn(a.id).subscribe({
      next: (res) => {
        const data = res.data;
        if (data?.appointment && data?.queueToken) {
          this.dialogs.open(CheckInResultDialogComponent, {
            width: '400px',
            data: { appointment: data.appointment, queueToken: data.queueToken as QueueToken }
          });
        } else {
          this.snack.success('WORKFLOW.CHECKED_IN');
        }
        if (this.patient) this.load(this.patient.id);
      },
      error: (e) => this.snack.error(e.message)
    });
  }

  onSendReminder(a: Appointment): void {
    this.appointmentSvc.sendReminder(a.id).subscribe({
      next: () => this.snack.success('WORKFLOW.REMINDER_SENT'),
      error: (e) => this.snack.error(e.message)
    });
  }

  canCheckIn(a: Appointment): boolean {
    return a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && a.status !== 'NO_SHOW';
  }

  canRemind(a: Appointment): boolean {
    return a.status === 'SCHEDULED' || a.status === 'CONFIRMED';
  }

  refresh(): void {
    if (this.patient) this.load(this.patient.id);
  }
}
