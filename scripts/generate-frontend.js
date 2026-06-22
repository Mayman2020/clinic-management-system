/**
 * Generates clinic-frontend Angular 17 application.
 * Run: node scripts/generate-frontend.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FE = path.join(ROOT, 'clinic-frontend');
const APP = path.join(FE, 'src', 'app');

let fileCount = 0;

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function write(rel, content) {
  const full = path.join(ROOT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, 'utf8');
  fileCount++;
}

// --- Config files ---
write('clinic-frontend/package.json', JSON.stringify({
  name: 'clinic-management-system',
  version: '1.0.0',
  scripts: {
    ng: 'ng', start: 'ng serve', build: 'ng build', watch: 'ng build --watch --configuration development', test: 'ng test'
  },
  private: true,
  dependencies: {
    '@angular/animations': '^17.3.0', '@angular/cdk': '^17.3.10', '@angular/common': '^17.3.12',
    '@angular/compiler': '^17.3.0', '@angular/core': '^17.3.0', '@angular/forms': '^17.3.0',
    '@angular/material': '^17.3.10', '@angular/platform-browser': '^17.3.0',
    '@angular/platform-browser-dynamic': '^17.3.0', '@angular/router': '^17.3.0',
    '@ngx-translate/core': '^17.0.0', '@ngx-translate/http-loader': '^17.0.0',
    'chart.js': '^4.4.3', 'ng2-charts': '^6.0.1', 'rxjs': '~7.8.0', 'tslib': '^2.3.0', 'zone.js': '~0.14.3'
  },
  devDependencies: {
    '@angular-devkit/build-angular': '^17.3.17', '@angular/cli': '^17.3.17', '@angular/compiler-cli': '^17.3.0',
    '@types/jasmine': '~5.1.0', 'jasmine-core': '~5.1.0', 'karma': '~6.4.0', 'karma-chrome-launcher': '~3.2.0',
    'karma-coverage': '~2.2.0', 'karma-jasmine': '~5.1.0', 'karma-jasmine-html-reporter': '~2.1.0', 'typescript': '~5.4.2'
  }
}, null, 2));

write('clinic-frontend/angular.json', `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "clinic-management-system": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": { "style": "scss", "standalone": true },
        "@schematics/angular:directive": { "standalone": true },
        "@schematics/angular:pipe": { "standalone": true }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/clinic-management-system",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["@angular/material/prebuilt-themes/indigo-pink.css", "src/styles.scss"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                { "type": "initial", "maximumWarning": "800kb", "maximumError": "1200kb" },
                { "type": "anyComponentStyle", "maximumWarning": "10kb", "maximumError": "14kb" }
              ],
              "outputHashing": "all"
            },
            "development": { "optimization": false, "extractLicenses": false, "sourceMap": true }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": { "buildTarget": "clinic-management-system:build:production" },
            "development": { "buildTarget": "clinic-management-system:build:development" }
          },
          "defaultConfiguration": "development"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["@angular/material/prebuilt-themes/indigo-pink.css", "src/styles.scss"],
            "scripts": []
          }
        }
      }
    }
  },
  "cli": { "analytics": false }
}
`);

write('clinic-frontend/tsconfig.json', `{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
`);

write('clinic-frontend/tsconfig.app.json', `{
  "extends": "./tsconfig.json",
  "compilerOptions": { "outDir": "./out-tsc/app", "types": [] },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
`);

write('clinic-frontend/tsconfig.spec.json', `{
  "extends": "./tsconfig.json",
  "compilerOptions": { "outDir": "./out-tsc/spec", "types": ["jasmine"] },
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
`);

write('clinic-frontend/src/main.ts', `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
`);

write('clinic-frontend/src/index.html', `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Clinic Management System</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons&family=Material+Icons+Outlined" rel="stylesheet">
  <script src="assets/runtime-config.js"></script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
`);

write('clinic-frontend/src/environments/environment.ts', `export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/api/v1',
  fileUrl: 'http://localhost:8082/api/v1/files'
};
`);

write('clinic-frontend/src/environments/environment.prod.ts', `export const environment = {
  production: true,
  apiUrl: '/api/v1',
  fileUrl: '/api/v1/files'
};
`);

write('clinic-frontend/src/assets/runtime-config.js', `window.__CM_API_URL__ = 'http://localhost:8082/api/v1';
window.__CM_FILE_URL__ = 'http://localhost:8082/api/v1/files';
`);

// i18n
write('clinic-frontend/src/assets/i18n/en.json', JSON.stringify({
  APP: { NAME: 'Clinic Management', TAGLINE: 'Clinic Management System', TAGLINE_SHORT: 'Clinic OS' },
  NAV_SECTION: { OVERVIEW: 'Overview', CLINICAL: 'Clinical', OPERATIONS: 'Operations', FINANCE: 'Finance', ADMIN: 'Administration' },
  NAV: {
    DASHBOARD: 'Dashboard', PATIENTS: 'Patients', DOCTORS: 'Doctors', APPOINTMENTS: 'Appointments',
    CALENDAR: 'Calendar', QUEUE: 'Queue', QUEUE_TV: 'Queue TV Display', CONSULTATION: 'Consultation',
    PRESCRIPTION: 'Prescriptions', LAB: 'Lab', RADIOLOGY: 'Radiology', BILLING: 'Billing',
    INSURANCE: 'Insurance', REPORTS: 'Reports', SETTINGS: 'Settings', USERS: 'Users', PROFILE: 'Profile'
  },
  ROLE: {
    ADMIN: 'Administrator', RECEPTIONIST: 'Receptionist', DOCTOR: 'Doctor', NURSE: 'Nurse',
    LAB_TECHNICIAN: 'Lab Technician', RADIOLOGY_STAFF: 'Radiology Staff', CASHIER: 'Cashier'
  },
  AUTH: { LOGIN: 'Sign in', LOGOUT: 'Sign out', EMAIL: 'Email', PASSWORD: 'Password', ENTER: 'Enter', INVALID_CREDENTIALS: 'Invalid email or password', LOGIN_FAILED: 'Login failed' },
  LOGIN: { HERO_TITLE_1: 'Clinical operations', HERO_TITLE_2: 'under control', HERO_SUBTITLE: 'Appointments, EMR, billing, and queue — one platform.', FORM_SUBTITLE: 'Sign in to your clinic workspace' },
  INLINE_TEXT: { COMMAND_CENTER: 'Command center', FORGOT_PASSWORD: 'Forgot password?' },
  COMMON: { LOADING: 'Loading…', SEARCH: 'Search', SAVE: 'Save', CANCEL: 'Cancel', CREATE: 'Create', EDIT: 'Edit', DELETE: 'Delete', ACTIONS: 'Actions', REFRESH: 'Refresh', NO_DATA: 'No records found', UNKNOWN: 'Unknown', STATUS: 'Status', DATE: 'Date', ALL: 'All' },
  TOPBAR: { TOGGLE_MENU: 'Toggle menu', LANGUAGE: 'Language', LIGHT_MODE: 'Light mode', DARK_MODE: 'Dark mode' },
  ERRORS: { GENERIC: 'Something went wrong', EMAIL_ALREADY_USED: 'This email is already in use' },
  DASHBOARD: { TITLE: 'Dashboard', REVENUE: 'Revenue', APPOINTMENTS: 'Appointments', PATIENTS_TODAY: 'Patients today', QUEUE_WAITING: 'Waiting in queue' },
  PATIENTS: { TITLE: 'Patients', NEW: 'New patient', CODE: 'Patient code', NAME: 'Name', PHONE: 'Phone', GENDER: 'Gender' },
  DOCTORS: { TITLE: 'Doctors', SPECIALTY: 'Specialty', SCHEDULES: 'Schedules', DEPARTMENT: 'Department' },
  APPOINTMENTS: { TITLE: 'Appointments', BOOK: 'Book appointment', PATIENT: 'Patient', DOCTOR: 'Doctor', TYPE: 'Type' },
  QUEUE: { TITLE: 'Queue', TOKEN: 'Token', CALL_NEXT: 'Call next', TV_MODE: 'TV display mode' },
  CONSULTATION: { TITLE: 'Consultation', CHIEF_COMPLAINT: 'Chief complaint', DIAGNOSIS: 'Diagnosis', NOTES: 'Notes' },
  PRESCRIPTION: { TITLE: 'Prescriptions', MEDICINE: 'Medicine', DOSAGE: 'Dosage', PRINT: 'Print' },
  LAB: { TITLE: 'Lab requests', TEST_TYPE: 'Test type' },
  RADIOLOGY: { TITLE: 'Radiology requests', STUDY_TYPE: 'Study type' },
  BILLING: { TITLE: 'Billing', INVOICES: 'Invoices', PAYMENTS: 'Payments', TOTAL: 'Total', AMOUNT: 'Amount' },
  INSURANCE: { TITLE: 'Insurance', PROVIDERS: 'Providers', CLAIMS: 'Claims' },
  REPORTS: { TITLE: 'Reports' },
  SETTINGS: { TITLE: 'Settings' },
  USERS: { TITLE: 'Users', USERNAME: 'Username', ROLE: 'Role' },
  PROFILE: { AVATAR_ALT: 'Profile photo' }
}, null, 2));

write('clinic-frontend/src/assets/i18n/ar.json', JSON.stringify({
  APP: { NAME: 'إدارة العيادة', TAGLINE: 'نظام إدارة العيادة', TAGLINE_SHORT: 'Clinic OS' },
  NAV_SECTION: { OVERVIEW: 'نظرة عامة', CLINICAL: 'سريري', OPERATIONS: 'عمليات', FINANCE: 'مالية', ADMIN: 'إدارة' },
  NAV: {
    DASHBOARD: 'لوحة التحكم', PATIENTS: 'المرضى', DOCTORS: 'الأطباء', APPOINTMENTS: 'المواعيد',
    CALENDAR: 'التقويم', QUEUE: 'الطابور', QUEUE_TV: 'شاشة الطابور', CONSULTATION: 'الاستشارة',
    PRESCRIPTION: 'الوصفات', LAB: 'المختبر', RADIOLOGY: 'الأشعة', BILLING: 'الفواتير',
    INSURANCE: 'التأمين', REPORTS: 'التقارير', SETTINGS: 'الإعدادات', USERS: 'المستخدمون', PROFILE: 'الملف الشخصي'
  },
  ROLE: {
    ADMIN: 'مدير النظام', RECEPTIONIST: 'موظف استقبال', DOCTOR: 'طبيب', NURSE: 'ممرض',
    LAB_TECHNICIAN: 'فني مختبر', RADIOLOGY_STAFF: 'موظف أشعة', CASHIER: 'أمين صندوق'
  },
  AUTH: { LOGIN: 'تسجيل الدخول', LOGOUT: 'تسجيل الخروج', EMAIL: 'البريد الإلكتروني', PASSWORD: 'كلمة المرور', ENTER: 'دخول', INVALID_CREDENTIALS: 'البريد أو كلمة المرور غير صحيحة', LOGIN_FAILED: 'فشل تسجيل الدخول' },
  LOGIN: { HERO_TITLE_1: 'عمليات العيادة', HERO_TITLE_2: 'تحت السيطرة', HERO_SUBTITLE: 'مواعيد، سجل طبي، فواتير وطابور — منصة واحدة.', FORM_SUBTITLE: 'سجّل الدخول إلى مساحة عمل العيادة' },
  INLINE_TEXT: { COMMAND_CENTER: 'مركز القيادة', FORGOT_PASSWORD: 'نسيت كلمة المرور؟' },
  COMMON: { LOADING: 'جاري التحميل…', SEARCH: 'بحث', SAVE: 'حفظ', CANCEL: 'إلغاء', CREATE: 'إنشاء', EDIT: 'تعديل', DELETE: 'حذف', ACTIONS: 'إجراءات', REFRESH: 'تحديث', NO_DATA: 'لا توجد سجلات', UNKNOWN: 'غير معروف', STATUS: 'الحالة', DATE: 'التاريخ', ALL: 'الكل' },
  TOPBAR: { TOGGLE_MENU: 'إظهار/إخفاء القائمة', LANGUAGE: 'اللغة', LIGHT_MODE: 'الوضع الفاتح', DARK_MODE: 'الوضع الداكن' },
  ERRORS: { GENERIC: 'حدث خطأ', EMAIL_ALREADY_USED: 'البريد الإلكتروني مستخدم بالفعل' },
  DASHBOARD: { TITLE: 'لوحة التحكم', REVENUE: 'الإيرادات', APPOINTMENTS: 'المواعيد', PATIENTS_TODAY: 'مرضى اليوم', QUEUE_WAITING: 'في الانتظار' },
  PATIENTS: { TITLE: 'المرضى', NEW: 'مريض جديد', CODE: 'رمز المريض', NAME: 'الاسم', PHONE: 'الهاتف', GENDER: 'الجنس' },
  DOCTORS: { TITLE: 'الأطباء', SPECIALTY: 'التخصص', SCHEDULES: 'الجداول', DEPARTMENT: 'القسم' },
  APPOINTMENTS: { TITLE: 'المواعيد', BOOK: 'حجز موعد', PATIENT: 'المريض', DOCTOR: 'الطبيب', TYPE: 'النوع' },
  QUEUE: { TITLE: 'الطابور', TOKEN: 'رقم', CALL_NEXT: 'استدعاء التالي', TV_MODE: 'وضع الشاشة' },
  CONSULTATION: { TITLE: 'الاستشارة', CHIEF_COMPLAINT: 'الشكوى الرئيسية', DIAGNOSIS: 'التشخيص', NOTES: 'ملاحظات' },
  PRESCRIPTION: { TITLE: 'الوصفات', MEDICINE: 'الدواء', DOSAGE: 'الجرعة', PRINT: 'طباعة' },
  LAB: { TITLE: 'طلبات المختبر', TEST_TYPE: 'نوع الفحص' },
  RADIOLOGY: { TITLE: 'طلبات الأشعة', STUDY_TYPE: 'نوع الدراسة' },
  BILLING: { TITLE: 'الفواتير', INVOICES: 'الفواتير', PAYMENTS: 'المدفوعات', TOTAL: 'الإجمالي', AMOUNT: 'المبلغ' },
  INSURANCE: { TITLE: 'التأمين', PROVIDERS: 'شركات التأمين', CLAIMS: 'المطالبات' },
  REPORTS: { TITLE: 'التقارير' },
  SETTINGS: { TITLE: 'الإعدادات' },
  USERS: { TITLE: 'المستخدمون', USERNAME: 'اسم المستخدم', ROLE: 'الدور' },
  PROFILE: { AVATAR_ALT: 'صورة الملف الشخصي' }
}, null, 2));

console.log(`Generated ${fileCount} config/i18n files so far...`);
