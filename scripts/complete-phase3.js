/**
 * Adds pagination to all list components. Run: node scripts/complete-phase3.js
 */
const fs = require('fs');
const path = require('path');

const FE = path.join(__dirname, '..', 'clinic-frontend', 'src', 'app', 'features');

const lists = [
  { dir: 'doctors/doctor-list', search: true, qParam: 'search' },
  { dir: 'appointments/appointment-list', search: true, loadExtra: 'const params: Record<string, string | number> = { page: this.page, size: this.size }; if (this.search) params[\'q\'] = this.search;' },
  { dir: 'lab/lab-list', search: false },
  { dir: 'radiology/radiology-list', search: false },
  { dir: 'prescription/prescription-list', search: false },
  { dir: 'billing/billing-list', search: false, loadCall: 'this.svc.listInvoices(this.page, this.size)' },
  { dir: 'insurance/insurance-list', search: false },
  { dir: 'users/user-list', search: true, qParam: 'search' }
];

for (const cfg of lists) {
  const tsPath = path.join(FE, cfg.dir, path.basename(cfg.dir) + '.component.ts');
  let ts = fs.readFileSync(tsPath, 'utf8');

  if (!ts.includes('MatPaginatorModule')) {
    ts = ts.replace(
      "import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';",
      "import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';\nimport { MatPaginatorModule, PageEvent } from '@angular/material/paginator';"
    );
    ts = ts.replace(
      'MatProgressSpinnerModule, MatDialogModule',
      'MatProgressSpinnerModule, MatPaginatorModule, MatDialogModule'
    );
    ts = ts.replace(
      'MatProgressSpinnerModule, PageHeaderComponent',
      'MatProgressSpinnerModule, MatPaginatorModule, PageHeaderComponent'
    );
  }

  if (!ts.includes('page = 0')) {
    ts = ts.replace('loading = false;\n', 'loading = false;\n  page = 0;\n  size = 10;\n  total = 0;\n');
  }

  if (!ts.includes('onPage(')) {
    ts = ts.replace(/\n}\s*$/, `
  onPage(e: PageEvent): void { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }
}
`);
  }

  // Fix load() to use pagination
  if (cfg.loadCall) {
    ts = ts.replace(/this\.svc\.listInvoices\(0, 50\)/, 'this.svc.listInvoices(this.page, this.size)');
  } else if (cfg.dir.includes('appointment')) {
    // appointments already has params object
    ts = ts.replace('this.svc.list(0, 50, params)', 'this.svc.list(this.page, this.size, params)');
  } else if (ts.includes('this.svc.list(0, 50')) {
    ts = ts.replace('this.svc.list(0, 50', 'this.svc.list(this.page, this.size');
  }

  if (!ts.includes('totalElements')) {
    ts = ts.replace(
      /this\.rows = res\.data\?\.content \?\? \[\];/g,
      'this.rows = res.data?.content ?? [];\n        this.total = res.data?.totalElements ?? 0;'
    );
  }

  fs.writeFileSync(tsPath, ts);

  const htmlPath = path.join(FE, cfg.dir, path.basename(cfg.dir) + '.component.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  if (!html.includes('mat-paginator')) {
    html = html.replace(
      '<p *ngIf="!rows.length" class="empty-state">{{ \'COMMON.NO_DATA\' | translate }}</p>',
      `<p *ngIf="!rows.length" class="empty-state">{{ 'COMMON.NO_DATA' | translate }}</p>
    <mat-paginator [length]="total" [pageSize]="size" [pageIndex]="page" [pageSizeOptions]="[10,20,50]" (page)="onPage($event)"></mat-paginator>`
    );
    html = html.replace('(keyup.enter)="load()"', '(keyup.enter)="page=0; load()"');
    html = html.replace('(click)="load()">{{ \'COMMON.SEARCH\'', '(click)="page=0; load()">{{ \'COMMON.SEARCH\'');
  }
  fs.writeFileSync(htmlPath, html);
  console.log('Updated', cfg.dir);
}

console.log('Phase 3 pagination done');
