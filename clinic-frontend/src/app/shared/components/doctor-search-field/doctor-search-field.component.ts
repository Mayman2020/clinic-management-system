import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/doctor.model';

@Component({
  selector: 'app-doctor-search-field',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule, TranslateModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DoctorSearchFieldComponent),
    multi: true
  }],
  template: `
    <mat-form-field appearance="outline" class="cm-search-field">
      <mat-label>{{ labelKey | translate }}</mat-label>
      <input matInput [formControl]="searchCtrl" [matAutocomplete]="auto" [placeholder]="'WORKFLOW.SEARCH_DOCTOR' | translate">
      <span matPrefix class="material-icons field-icon">medical_services</span>
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayDoctor" (optionSelected)="onSelected($event.option.value)">
        <mat-option *ngFor="let d of options" [value]="d">{{ d.doctorCode }} — {{ d.firstName }} {{ d.lastName }}</mat-option>
        <mat-option *ngIf="!loading && !options.length && searchTextLength >= 2" disabled>{{ 'COMMON.NO_DATA' | translate }}</mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`.cm-search-field { width: 100%; } .field-icon { font-size: 20px; margin-inline-end: 6px; opacity: 0.6; }`]
})
export class DoctorSearchFieldComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() labelKey = 'CONSULTATION.SELECT_DOCTOR';

  searchCtrl = new FormControl<string | Doctor>('');
  options: Doctor[] = [];
  loading = false;
  private selected?: Doctor;
  private readonly destroy$ = new Subject<void>();
  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly doctorSvc: DoctorService) {}

  ngOnInit(): void {
    this.doctorSvc.listActive().subscribe({ next: (r) => { this.options = r.data ?? []; } });
    this.searchCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((v) => {
        if (typeof v === 'object' && v) return of([v]);
        const q = (v ?? '').toString().trim();
        if (q.length < 2) return of(this.options);
        this.loading = true;
        return this.doctorSvc.list(0, 20, q);
      })
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.options = Array.isArray(res) ? res : (res.data?.content ?? []);
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  writeValue(id: number | null): void {
    if (!id) { this.searchCtrl.setValue('', { emitEvent: false }); return; }
    if (this.selected?.id === id) {
      this.searchCtrl.setValue(this.selected, { emitEvent: false });
      return;
    }
    this.doctorSvc.getById(id).subscribe({
      next: (r) => {
        if (r.data) {
          this.selected = r.data;
          this.searchCtrl.setValue(r.data, { emitEvent: false });
        }
      }
    });
  }

  registerOnChange(fn: (v: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { disabled ? this.searchCtrl.disable() : this.searchCtrl.enable(); }

  displayDoctor = (v: Doctor | string | null): string => {
    if (!v || typeof v === 'string') return v ?? '';
    return `${v.doctorCode} — ${v.firstName} ${v.lastName}`;
  };

  onSelected(doctor: Doctor): void {
    this.selected = doctor;
    this.onChange(doctor.id);
    this.onTouched();
  }

  get searchTextLength(): number {
    const v = this.searchCtrl.value;
    return typeof v === 'string' ? v.length : 0;
  }
}
