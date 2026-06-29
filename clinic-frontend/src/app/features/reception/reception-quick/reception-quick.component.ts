import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { RmsDialogService } from '../../../shared/services/rms-dialog.service';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PatientSearchFieldComponent } from '../../../shared/components/patient-search-field/patient-search-field.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { SnackService } from '../../../core/services/snack.service';
import { Patient } from '../../../core/models/patient.model';
import { CheckInResultDialogComponent } from '../../appointments/check-in-result-dialog/check-in-result-dialog.component';
import { QueueToken } from '../../../core/models/queue.model';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-reception-quick',
  standalone: true,
  imports: [
    NgFor, NgIf, RouterLink, ReactiveFormsModule, TranslateModule,
    MatButtonModule, MatIconModule, MatDialogModule, PageHeaderComponent, PatientSearchFieldComponent
  ],
  templateUrl: './reception-quick.component.html',
  styleUrl: './reception-quick.component.scss'
})
export class ReceptionQuickComponent {
  patientCtrl = new FormControl<number | null>(null);
  selectedPatient?: Patient;
  todayAppointments: { id: number; appointmentNo: string; doctorName?: string; status: string; patientId: number; doctorId?: number }[] = [];
  loadingAppts = false;

  constructor(
    private readonly appointmentSvc: AppointmentService,
    private readonly patientSvc: PatientService,
    private readonly snack: SnackService,
    private readonly dialogs: RmsDialogService,
    private readonly router: Router
  ) {
    this.patientCtrl.valueChanges.subscribe((id) => {
      if (id) {
        this.patientSvc.getById(id).subscribe({
          next: (r) => { this.selectedPatient = r.data; this.loadAppointments(id); },
          error: (e) => this.snack.error(e.message)
        });
      } else {
        this.selectedPatient = undefined;
        this.todayAppointments = [];
      }
    });
  }

  loadAppointments(patientId: number): void {
    this.loadingAppts = true;
    this.appointmentSvc.getByPatient(patientId).subscribe({
      next: (r) => {
        const today = new Date().toISOString().slice(0, 10);
        this.todayAppointments = (r.data ?? []).filter((a) => a.appointmentDate === today);
        this.loadingAppts = false;
      },
      error: (e) => { this.snack.error(e.message); this.loadingAppts = false; }
    });
  }

  checkIn(appointmentId: number): void {
    this.appointmentSvc.checkIn(appointmentId).subscribe({
      next: (res) => {
        const data = res.data;
        if (!data?.appointment || !data?.queueToken) {
          this.snack.success('WORKFLOW.CHECKED_IN');
          return;
        }
        this.dialogs.open(CheckInResultDialogComponent, {
          width: '400px',
          data: {
            appointment: data.appointment as Appointment,
            queueToken: data.queueToken as QueueToken
          }
        });
        if (this.selectedPatient) this.loadAppointments(this.selectedPatient.id);
      },
      error: (e) => this.snack.error(e.message)
    });
  }

  walkIn(): void {
    if (!this.selectedPatient) return;
    void this.router.navigate(['/admin/appointments'], { queryParams: { walkin: this.selectedPatient.id } });
  }
}
