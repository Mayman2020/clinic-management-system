import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslateKeyPipe } from '../../../shared/pipes/translate-key.pipe';
import { QueueService } from '../../../core/services/queue.service';
import { QueueRealtimeService } from '../../../core/services/queue-realtime.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { QueueToken } from '../../../core/models/queue.model';
import { Doctor } from '../../../core/models/doctor.model';
import { SnackService } from '../../../core/services/snack.service';
import { QueueTokenDialogComponent } from '../queue-token-dialog/queue-token-dialog.component';

@Component({
  selector: 'app-queue-dashboard', standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink, TranslateModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatIconModule, PageHeaderComponent, TranslateKeyPipe],
  templateUrl: './queue-dashboard.component.html',
  styleUrl: './queue-dashboard.component.scss'
})
export class QueueDashboardComponent implements OnInit, OnDestroy {
  tokens: QueueToken[] = [];
  doctors: Doctor[] = [];
  current?: QueueToken;
  doctorId?: number;
  private disconnect?: () => void;
  private fallbackTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly svc: QueueService,
    private readonly realtime: QueueRealtimeService,
    private readonly doctorSvc: DoctorService,
    private readonly snack: SnackService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.refresh();
    this.disconnect = this.realtime.connectDashboard(() => this.refresh());
    this.fallbackTimer = setInterval(() => this.refresh(), 60000);
  }

  ngOnDestroy(): void {
    this.disconnect?.();
    if (this.fallbackTimer) clearInterval(this.fallbackTimer);
  }

  loadDoctors(): void {
    this.doctorSvc.listActive().subscribe({
      next: (r) => { this.doctors = r.data ?? []; },
      error: () => { /* optional filter */ }
    });
  }

  refresh(): void {
    this.svc.getToday(this.doctorId).subscribe({
      next: (r) => {
        this.tokens = r.data ?? [];
        this.current = this.tokens.find(t => t.status === 'CALLED' || t.status === 'IN_SERVICE');
      },
      error: (e) => this.snack.error(e.message)
    });
  }

  onDoctorFilter(): void { this.refresh(); }

  onGenerate(): void {
    this.dialog.open(QueueTokenDialogComponent, { width: '420px' }).afterClosed().subscribe((saved) => { if (saved) this.refresh(); });
  }

  callNext(): void {
    this.svc.callNext(this.doctorId).subscribe({
      next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.refresh(); },
      error: (e) => this.snack.error(e.message)
    });
  }

  setStatus(token: QueueToken, status: string): void {
    this.svc.updateStatus(token.id, status).subscribe({
      next: () => { this.snack.success('MESSAGES.STATUS_UPDATED'); this.refresh(); },
      error: (e) => this.snack.error(e.message)
    });
  }
}
