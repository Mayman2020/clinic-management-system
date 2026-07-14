import { Component, Input } from '@angular/core';

let _uid = 0;

@Component({
  selector: 'app-clinic-logo',
  standalone: true,
  templateUrl: './clinic-logo.component.html',
  styleUrl: './clinic-logo.component.scss'
})
export class ClinicLogoComponent {
  @Input() size = 40;
  @Input() float = false;
  readonly uid = `cl${++_uid}`;
}
