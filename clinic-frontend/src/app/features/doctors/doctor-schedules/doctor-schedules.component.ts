import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DoctorService } from '../../../core/services/doctor.service';
import { DoctorSchedule } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-doctor-schedules', standalone: true, imports: [NgFor, NgIf, TranslateModule],
  template: `<div *ngIf="schedules.length"><div *ngFor="let s of schedules">{{ s.dayOfWeek }} {{ s.startTime }}-{{ s.endTime }}</div></div><p *ngIf="!schedules.length">{{ 'COMMON.NO_DATA' | translate }}</p>`
})
export class DoctorSchedulesComponent implements OnInit {
  @Input() doctorId!: number;
  schedules: DoctorSchedule[] = [];
  constructor(private readonly svc: DoctorService) {}
  ngOnInit(): void { if (this.doctorId) this.svc.getSchedules(this.doctorId).subscribe({ next: (r) => this.schedules = r.data ?? [] }); }
}
