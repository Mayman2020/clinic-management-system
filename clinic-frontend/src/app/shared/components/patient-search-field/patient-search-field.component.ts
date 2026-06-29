import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-search-field',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule, TranslateModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PatientSearchFieldComponent),
    multi: true
  }],
  template: `
    <mat-form-field appearance="outline" class="cm-search-field" subscriptSizing="dynamic">
      <mat-label>{{ labelKey | translate }}</mat-label>
      <input matInput [formControl]="searchCtrl" [matAutocomplete]="auto" [placeholder]="'WORKFLOW.SEARCH_PATIENT' | translate">
      <span matPrefix class="material-icons field-icon">person_search</span>
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayPatient" (optionSelected)="onSelected($event.option.value)">
        <mat-option *ngFor="let p of options" [value]="p">{{ p.patientCode }} — {{ p.firstName }} {{ p.lastName }}</mat-option>
        <mat-option *ngIf="!loading && !options.length && searchTextLength >= 2" disabled>{{ 'COMMON.NO_DATA' | translate }}</mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`.cm-search-field { width: 100%; } .field-icon { font-size: 20px; margin-inline-end: 6px; opacity: 0.6; }`]
})
export class PatientSearchFieldComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() labelKey = 'CONSULTATION.SELECT_PATIENT';

  searchCtrl = new FormControl<string | Patient>('');
  options: Patient[] = [];
  loading = false;
  private patientId: number | null = null;
  private selected?: Patient;
  private readonly destroy$ = new Subject<void>();
  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly patientSvc: PatientService) {}

  ngOnInit(): void {
    this.searchCtrl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((v) => {
        if (typeof v === 'object' && v) return of([v]);
        const q = (v ?? '').toString().trim();
        if (q.length < 2) { this.options = []; return of([] as Patient[]); }
        this.loading = true;
        return this.patientSvc.search(q);
      })
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.options = Array.isArray(res) ? res : (res.data?.content ?? []);
      },
      error: () => { this.loading = false; this.options = []; }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  writeValue(id: number | null): void {
    this.patientId = id;
    if (id && this.selected?.id === id) {
      this.searchCtrl.setValue(this.selected, { emitEvent: false });
      return;
    }
    if (id) {
      this.patientSvc.getById(id).subscribe({
        next: (r) => {
          if (r.data) {
            this.selected = r.data;
            this.searchCtrl.setValue(r.data, { emitEvent: false });
          }
        }
      });
    } else {
      this.searchCtrl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (v: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { disabled ? this.searchCtrl.disable() : this.searchCtrl.enable(); }

  displayPatient = (v: Patient | string | null): string => {
    if (!v || typeof v === 'string') return v ?? '';
    return `${v.patientCode} — ${v.firstName} ${v.lastName}`;
  };

  onSelected(patient: Patient): void {
    this.selected = patient;
    this.patientId = patient.id;
    this.onChange(patient.id);
    this.onTouched();
  }

  get searchTextLength(): number {
    const v = this.searchCtrl.value;
    return typeof v === 'string' ? v.length : 0;
  }
}
