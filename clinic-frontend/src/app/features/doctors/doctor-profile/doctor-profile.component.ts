import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [NgIf, RouterLink, TranslateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.scss'
})
export class DoctorProfileComponent implements OnInit {
  loading = true;
  doctor: Doctor | null = null;
  doctorName = '';
  initials = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly doctors: DoctorService,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.doctors.getById(id).subscribe({
      next: (r) => {
        this.doctor = r.data ?? null;
        this.doctorName = this.doctor ? `${this.doctor.firstName} ${this.doctor.lastName}`.trim() : '';
        this.initials = this.doctorName.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
        this.loading = false;
      },
      error: (e) => { this.snack.error(e.message); this.loading = false; }
    });
  }
}
