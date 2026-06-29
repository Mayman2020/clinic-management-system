import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor, NgIf } from '@angular/common';
import { LookupItem, LookupService, LookupType } from '../../../core/services/lookup.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-lookup-select',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, TranslateModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LookupSelectComponent),
    multi: true
  }],
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>{{ labelKey | translate }}</mat-label>
      <mat-select [value]="value" (valueChange)="onSelect($event)" [disabled]="disabled" [required]="required">
        <mat-option *ngFor="let item of items" [value]="valueField === 'code' ? item.code : item.id">
          {{ label(item) }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`:host { display: block; } :host(.full) { grid-column: 1 / -1; }`]
})
export class LookupSelectComponent implements ControlValueAccessor, OnInit {
  @Input({ required: true }) lookupType!: LookupType;
  @Input() labelKey = '';
  @Input() valueField: 'code' | 'id' = 'code';
  @Input() required = false;

  items: LookupItem[] = [];
  value: string | number | null = null;
  disabled = false;

  private onChange: (v: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private readonly lookupSvc: LookupService,
    private readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.lookupSvc.getByType(this.lookupType).subscribe({
      next: (res) => { this.items = res.data ?? []; }
    });
  }

  label(item: LookupItem): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  onSelect(v: string | number | null): void {
    this.value = v;
    this.onChange(v);
    this.onTouched();
  }

  writeValue(v: string | number | null): void { this.value = v; }
  registerOnChange(fn: (v: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
