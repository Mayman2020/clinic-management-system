/**
 * Completes business logic, i18n, and frontend-backend alignment.
 * Run: node scripts/complete-business.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BE = path.join(ROOT, 'clinic-backend', 'src', 'main', 'java', 'com', 'clinicmanagement');
const FE = path.join(ROOT, 'clinic-frontend', 'src', 'app');
const I18N = path.join(ROOT, 'clinic-frontend', 'src', 'assets', 'i18n');

function w(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

// ========== i18n ==========
const en = {
  APP: { NAME: 'Clinic Management', TAGLINE: 'Clinic Management System', TAGLINE_SHORT: 'Clinic OS' },
  NAV_SECTION: { OVERVIEW: 'Overview', CLINICAL: 'Clinical', OPERATIONS: 'Operations', FINANCE: 'Finance', ADMIN: 'Administration' },
  NAV: { DASHBOARD: 'Dashboard', PATIENTS: 'Patients', DOCTORS: 'Doctors', APPOINTMENTS: 'Appointments', CALENDAR: 'Calendar', QUEUE: 'Queue', QUEUE_TV: 'Queue TV Display', CONSULTATION: 'Consultation', PRESCRIPTION: 'Prescriptions', LAB: 'Lab', RADIOLOGY: 'Radiology', BILLING: 'Billing', INSURANCE: 'Insurance', REPORTS: 'Reports', SETTINGS: 'Settings', USERS: 'Users', PROFILE: 'Profile' },
  ROLE: { ADMIN: 'Administrator', RECEPTIONIST: 'Receptionist', DOCTOR: 'Doctor', NURSE: 'Nurse', LAB_TECHNICIAN: 'Lab Technician', RADIOLOGY_STAFF: 'Radiology Staff', CASHIER: 'Cashier' },
  AUTH: { LOGIN: 'Sign in', LOGOUT: 'Sign out', EMAIL: 'Email', USERNAME: 'Username', PASSWORD: 'Password', ENTER: 'Enter', INVALID_CREDENTIALS: 'Invalid username or password', LOGIN_FAILED: 'Login failed' },
  LOGIN: { HERO_TITLE_1: 'Clinical operations', HERO_TITLE_2: 'under control', HERO_SUBTITLE: 'Appointments, EMR, billing, and queue — one platform.', FORM_SUBTITLE: 'Sign in to your clinic workspace' },
  INLINE_TEXT: { COMMAND_CENTER: 'Command center', FORGOT_PASSWORD: 'Forgot password?' },
  COMMON: { LOADING: 'Loading…', SEARCH: 'Search', SAVE: 'Save', SAVED: 'Saved successfully', CANCEL: 'Cancel', CREATE: 'Create', EDIT: 'Edit', DELETE: 'Delete', ARCHIVE: 'Archive', CONFIRM: 'Confirm', ACTIONS: 'Actions', REFRESH: 'Refresh', NO_DATA: 'No records found', UNKNOWN: 'Unknown', STATUS: 'Status', DATE: 'Date', TIME: 'Time', ALL: 'All', NUMBER: 'Number', YES: 'Yes', NO: 'No', CLOSE: 'Close', PRINT: 'Print', SELECT: 'Select', REQUIRED: 'Required field', USER_INITIAL: 'U', DETAILS: 'Details', TOTAL: 'Total', NOTES: 'Notes', SUCCESS: 'Operation completed', ERROR: 'An error occurred', DELETE_CONFIRM: 'Are you sure you want to delete this record?' },
  TOPBAR: { TOGGLE_MENU: 'Toggle menu', LANGUAGE: 'Language', LIGHT_MODE: 'Light mode', DARK_MODE: 'Dark mode' },
  ERRORS: { GENERIC: 'Something went wrong', EMAIL_ALREADY_USED: 'This email is already in use', NOT_FOUND: 'Record not found', FORBIDDEN: 'Access denied' },
  MESSAGES: { ARCHIVED: 'Record archived', DELETED: 'Record deleted', STATUS_UPDATED: 'Status updated', PAYMENT_RECORDED: 'Payment recorded' },
  DASHBOARD: { TITLE: 'Dashboard', REVENUE: 'Revenue', APPOINTMENTS: 'Appointments', PATIENTS_TODAY: 'Patients today', QUEUE_WAITING: 'Waiting in queue', DOCTOR_PERFORMANCE: 'Doctor performance', TOP_SERVICES: 'Top services', PATIENT_STATS: 'Patient statistics', INSURANCE_CLAIMS: 'Insurance claims', MONTHLY_REVENUE: 'Monthly revenue', DAILY_REVENUE: 'Daily revenue' },
  PATIENTS: { TITLE: 'Patients', NEW: 'New patient', CODE: 'Patient code', NAME: 'First name', LAST_NAME: 'Last name', PHONE: 'Phone', GENDER: 'Gender', EMAIL: 'Email', NATIONAL_ID: 'National ID', ADDRESS: 'Address', ALLERGIES: 'Allergies', CHRONIC: 'Chronic diseases', EMERGENCY_CONTACT: 'Emergency contact', ARCHIVE_CONFIRM: 'Archive this patient?' },
  DOCTORS: { TITLE: 'Doctors', NEW: 'New doctor', CODE: 'Doctor code', NAME: 'First name', LAST_NAME: 'Last name', SPECIALTY: 'Specialty', SCHEDULES: 'Schedules', DEPARTMENT: 'Department', FEE: 'Consultation fee', DAY: 'Day', START: 'Start time', END: 'End time' },
  APPOINTMENTS: { TITLE: 'Appointments', NEW: 'New appointment', BOOK: 'Book appointment', PATIENT: 'Patient', DOCTOR: 'Doctor', TYPE: 'Type', RESCHEDULE: 'Reschedule', CANCEL: 'Cancel', CONFIRM: 'Confirm', WALK_IN: 'Walk-in', NO: 'Appointment no.' },
  QUEUE: { TITLE: 'Queue', TOKEN: 'Token', CALL_NEXT: 'Call next', TV_MODE: 'TV display mode', WAITING: 'Waiting', CURRENT: 'Current token', ESTIMATED_WAIT: 'Estimated wait (min)' },
  CONSULTATION: { TITLE: 'Consultation', CHIEF_COMPLAINT: 'Chief complaint / Symptoms', DIAGNOSIS: 'Diagnosis', NOTES: 'Notes', TREATMENT: 'Treatment plan', FOLLOW_UP: 'Follow-up date', SELECT_PATIENT: 'Select patient', SELECT_DOCTOR: 'Select doctor' },
  PRESCRIPTION: { TITLE: 'Prescriptions', NEW: 'New prescription', MEDICINE: 'Medicine', DOSAGE: 'Dosage', FREQUENCY: 'Frequency', DURATION: 'Duration', PRINT: 'Print', NO: 'Prescription no.' },
  LAB: { TITLE: 'Lab requests', NEW: 'New lab request', TEST_TYPE: 'Test type', CATEGORY: 'Category', REQUEST_NO: 'Request no.', RESULT: 'Result PDF URL', NEXT_STATUS: 'Advance status' },
  RADIOLOGY: { TITLE: 'Radiology requests', NEW: 'New radiology request', STUDY_TYPE: 'Study type', REQUEST_NO: 'Request no.', SCHEDULED_AT: 'Scheduled at', REPORT: 'Report', IMAGE_URL: 'Image URL', NEXT_STATUS: 'Advance status' },
  BILLING: { TITLE: 'Billing', NEW: 'New invoice', INVOICES: 'Invoices', PAYMENTS: 'Payments', TOTAL: 'Total', AMOUNT: 'Amount', INVOICE_NO: 'Invoice no.', SUBTOTAL: 'Subtotal', DISCOUNT: 'Discount', TAX: 'Tax', PAID: 'Paid', PAY: 'Record payment', METHOD: 'Payment method' },
  INSURANCE: { TITLE: 'Insurance', NEW: 'New claim', PROVIDERS: 'Providers', CLAIMS: 'Claims', CLAIM_NO: 'Claim no.', PROVIDER: 'Provider', COPAYMENT: 'Copayment', SUBMIT: 'Submit claim' },
  REPORTS: { TITLE: 'Reports', REVENUE: 'Revenue report', APPOINTMENTS: 'Appointments report', PATIENTS: 'Patients report', DOCTORS: 'Doctors report' },
  SETTINGS: { TITLE: 'Settings', CLINIC_NAME: 'Clinic name', CLINIC_PHONE: 'Clinic phone', CLINIC_ADDRESS: 'Clinic address', CLINIC_EMAIL: 'Clinic email' },
  USERS: { TITLE: 'Users', NEW: 'New user', USERNAME: 'Username', ROLE: 'Role', FULL_NAME: 'Full name', ACTIVE: 'Active' },
  PROFILE: { AVATAR_ALT: 'Profile photo' },
  GENDER: { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' },
  SPECIALTY: { DENTAL: 'Dental', DERMATOLOGY: 'Dermatology', ENT: 'ENT', PEDIATRICS: 'Pediatrics', ORTHOPEDIC: 'Orthopedic', GENERAL_MEDICINE: 'General medicine' },
  DAY: { '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday' },
  STATUS: {
    SCHEDULED: 'Scheduled', CONFIRMED: 'Confirmed', WAITING: 'Waiting', IN_PROGRESS: 'In progress', IN_CONSULTATION: 'In consultation',
    COMPLETED: 'Completed', CANCELLED: 'Cancelled', NO_SHOW: 'No show', ACTIVE: 'Active', PENDING: 'Pending', PAID: 'Paid', PARTIAL: 'Partial',
    REQUESTED: 'Requested', SAMPLE_COLLECTED: 'Sample collected', PROCESSING: 'Processing', IN_SERVICE: 'In service', CALLED: 'Called', SKIPPED: 'Skipped',
    APPROVED: 'Approved', REJECTED: 'Rejected', SUBMITTED: 'Submitted'
  },
  PAYMENT_METHOD: { CASH: 'Cash', CARD: 'Card', INSURANCE: 'Insurance', MIXED: 'Mixed' }
};

const ar = JSON.parse(JSON.stringify(en));
Object.assign(ar.APP, { NAME: 'إدارة العيادة', TAGLINE: 'نظام إدارة العيادة', TAGLINE_SHORT: 'نظام العيادة' });
Object.assign(ar.NAV_SECTION, { OVERVIEW: 'نظرة عامة', CLINICAL: 'سريري', OPERATIONS: 'عمليات', FINANCE: 'مالية', ADMIN: 'إدارة' });
Object.assign(ar.NAV, { DASHBOARD: 'لوحة التحكم', PATIENTS: 'المرضى', DOCTORS: 'الأطباء', APPOINTMENTS: 'المواعيد', CALENDAR: 'التقويم', QUEUE: 'الطابور', QUEUE_TV: 'شاشة الطابور', CONSULTATION: 'الاستشارة', PRESCRIPTION: 'الوصفات', LAB: 'المختبر', RADIOLOGY: 'الأشعة', BILLING: 'الفواتير', INSURANCE: 'التأمين', REPORTS: 'التقارير', SETTINGS: 'الإعدادات', USERS: 'المستخدمون', PROFILE: 'الملف الشخصي' });
Object.assign(ar.ROLE, { ADMIN: 'مدير النظام', RECEPTIONIST: 'موظف استقبال', DOCTOR: 'طبيب', NURSE: 'ممرض', LAB_TECHNICIAN: 'فني مختبر', RADIOLOGY_STAFF: 'موظف أشعة', CASHIER: 'أمين صندوق' });
Object.assign(ar.AUTH, { LOGIN: 'تسجيل الدخول', LOGOUT: 'تسجيل الخروج', EMAIL: 'البريد الإلكتروني', USERNAME: 'اسم المستخدم', PASSWORD: 'كلمة المرور', ENTER: 'دخول', INVALID_CREDENTIALS: 'اسم المستخدم أو كلمة المرور غير صحيحة', LOGIN_FAILED: 'فشل تسجيل الدخول' });
Object.assign(ar.LOGIN, { HERO_TITLE_1: 'عمليات العيادة', HERO_TITLE_2: 'تحت السيطرة', HERO_SUBTITLE: 'مواعيد، سجل طبي، فواتير وطابور — منصة واحدة.', FORM_SUBTITLE: 'سجّل الدخول إلى مساحة عمل العيادة' });
Object.assign(ar.INLINE_TEXT, { COMMAND_CENTER: 'مركز القيادة', FORGOT_PASSWORD: 'نسيت كلمة المرور؟' });
Object.assign(ar.COMMON, { LOADING: 'جاري التحميل…', SEARCH: 'بحث', SAVE: 'حفظ', SAVED: 'تم الحفظ بنجاح', CANCEL: 'إلغاء', CREATE: 'إنشاء', EDIT: 'تعديل', DELETE: 'حذف', ARCHIVE: 'أرشفة', CONFIRM: 'تأكيد', ACTIONS: 'إجراءات', REFRESH: 'تحديث', NO_DATA: 'لا توجد سجلات', UNKNOWN: 'غير معروف', STATUS: 'الحالة', DATE: 'التاريخ', TIME: 'الوقت', ALL: 'الكل', NUMBER: 'الرقم', YES: 'نعم', NO: 'لا', CLOSE: 'إغلاق', PRINT: 'طباعة', SELECT: 'اختر', REQUIRED: 'حقل مطلوب', USER_INITIAL: 'م', DETAILS: 'التفاصيل', TOTAL: 'الإجمالي', NOTES: 'ملاحظات', SUCCESS: 'تمت العملية', ERROR: 'حدث خطأ', DELETE_CONFIRM: 'هل أنت متأكد من حذف هذا السجل؟' });
Object.assign(ar.TOPBAR, { TOGGLE_MENU: 'إظهار/إخفاء القائمة', LANGUAGE: 'اللغة', LIGHT_MODE: 'الوضع الفاتح', DARK_MODE: 'الوضع الداكن' });
Object.assign(ar.ERRORS, { GENERIC: 'حدث خطأ', EMAIL_ALREADY_USED: 'البريد الإلكتروني مستخدم', NOT_FOUND: 'السجل غير موجود', FORBIDDEN: 'غير مصرح' });
Object.assign(ar.MESSAGES, { ARCHIVED: 'تمت الأرشفة', DELETED: 'تم الحذف', STATUS_UPDATED: 'تم تحديث الحالة', PAYMENT_RECORDED: 'تم تسجيل الدفع' });
Object.assign(ar.DASHBOARD, { TITLE: 'لوحة التحكم', REVENUE: 'الإيرادات', APPOINTMENTS: 'المواعيد', PATIENTS_TODAY: 'مرضى اليوم', QUEUE_WAITING: 'في الانتظار', DOCTOR_PERFORMANCE: 'أداء الأطباء', TOP_SERVICES: 'أكثر الخدمات', PATIENT_STATS: 'إحصائيات المرضى', INSURANCE_CLAIMS: 'مطالبات التأمين', MONTHLY_REVENUE: 'الإيرادات الشهرية', DAILY_REVENUE: 'الإيرادات اليومية' });
Object.assign(ar.PATIENTS, { TITLE: 'المرضى', NEW: 'مريض جديد', CODE: 'رمز المريض', NAME: 'الاسم الأول', LAST_NAME: 'اسم العائلة', PHONE: 'الهاتف', GENDER: 'الجنس', EMAIL: 'البريد', NATIONAL_ID: 'رقم الهوية', ADDRESS: 'العنوان', ALLERGIES: 'الحساسية', CHRONIC: 'الأمراض المزمنة', EMERGENCY_CONTACT: 'جهة الطوارئ', ARCHIVE_CONFIRM: 'أرشفة هذا المريض؟' });
Object.assign(ar.DOCTORS, { TITLE: 'الأطباء', NEW: 'طبيب جديد', CODE: 'رمز الطبيب', NAME: 'الاسم الأول', LAST_NAME: 'اسم العائلة', SPECIALTY: 'التخصص', SCHEDULES: 'الجداول', DEPARTMENT: 'القسم', FEE: 'رسوم الاستشارة', DAY: 'اليوم', START: 'وقت البداية', END: 'وقت النهاية' });
Object.assign(ar.APPOINTMENTS, { TITLE: 'المواعيد', NEW: 'موعد جديد', BOOK: 'حجز موعد', PATIENT: 'المريض', DOCTOR: 'الطبيب', TYPE: 'النوع', RESCHEDULE: 'إعادة جدولة', CANCEL: 'إلغاء', CONFIRM: 'تأكيد', WALK_IN: 'حضور مباشر', NO: 'رقم الموعد' });
Object.assign(ar.QUEUE, { TITLE: 'الطابور', TOKEN: 'رقم', CALL_NEXT: 'استدعاء التالي', TV_MODE: 'وضع الشاشة', WAITING: 'انتظار', CURRENT: 'الرقم الحالي', ESTIMATED_WAIT: 'وقت الانتظار (د)' });
Object.assign(ar.CONSULTATION, { TITLE: 'الاستشارة', CHIEF_COMPLAINT: 'الشكوى / الأعراض', DIAGNOSIS: 'التشخيص', NOTES: 'ملاحظات', TREATMENT: 'خطة العلاج', FOLLOW_UP: 'موعد المتابعة', SELECT_PATIENT: 'اختر المريض', SELECT_DOCTOR: 'اختر الطبيب' });
Object.assign(ar.PRESCRIPTION, { TITLE: 'الوصفات', NEW: 'وصفة جديدة', MEDICINE: 'الدواء', DOSAGE: 'الجرعة', FREQUENCY: 'التكرار', DURATION: 'المدة', PRINT: 'طباعة', NO: 'رقم الوصفة' });
Object.assign(ar.LAB, { TITLE: 'طلبات المختبر', NEW: 'طلب مختبر جديد', TEST_TYPE: 'نوع الفحص', CATEGORY: 'الفئة', REQUEST_NO: 'رقم الطلب', RESULT: 'رابط نتيجة PDF', NEXT_STATUS: 'تقديم الحالة' });
Object.assign(ar.RADIOLOGY, { TITLE: 'طلبات الأشعة', NEW: 'طلب أشعة جديد', STUDY_TYPE: 'نوع الدراسة', REQUEST_NO: 'رقم الطلب', SCHEDULED_AT: 'موعد الجدولة', REPORT: 'التقرير', IMAGE_URL: 'رابط الصورة', NEXT_STATUS: 'تقديم الحالة' });
Object.assign(ar.BILLING, { TITLE: 'الفواتير', NEW: 'فاتورة جديدة', INVOICES: 'الفواتير', PAYMENTS: 'المدفوعات', TOTAL: 'الإجمالي', AMOUNT: 'المبلغ', INVOICE_NO: 'رقم الفاتورة', SUBTOTAL: 'المجموع', DISCOUNT: 'الخصم', TAX: 'الضريبة', PAID: 'المدفوع', PAY: 'تسجيل دفع', METHOD: 'طريقة الدفع' });
Object.assign(ar.INSURANCE, { TITLE: 'التأمين', NEW: 'مطالبة جديدة', PROVIDERS: 'شركات التأمين', CLAIMS: 'المطالبات', CLAIM_NO: 'رقم المطالبة', PROVIDER: 'شركة التأمين', COPAYMENT: 'المشاركة', SUBMIT: 'تقديم مطالبة' });
Object.assign(ar.REPORTS, { TITLE: 'التقارير', REVENUE: 'تقرير الإيرادات', APPOINTMENTS: 'تقرير المواعيد', PATIENTS: 'تقرير المرضى', DOCTORS: 'تقرير الأطباء' });
Object.assign(ar.SETTINGS, { TITLE: 'الإعدادات', CLINIC_NAME: 'اسم العيادة', CLINIC_PHONE: 'هاتف العيادة', CLINIC_ADDRESS: 'عنوان العيادة', CLINIC_EMAIL: 'بريد العيادة' });
Object.assign(ar.USERS, { TITLE: 'المستخدمون', NEW: 'مستخدم جديد', USERNAME: 'اسم المستخدم', ROLE: 'الدور', FULL_NAME: 'الاسم الكامل', ACTIVE: 'نشط' });
Object.assign(ar.PROFILE, { AVATAR_ALT: 'صورة الملف الشخصي' });
Object.assign(ar.GENDER, { MALE: 'ذكر', FEMALE: 'أنثى', OTHER: 'أخرى' });
Object.assign(ar.SPECIALTY, { DENTAL: 'أسنان', DERMATOLOGY: 'جلدية', ENT: 'أنف وأذن', PEDIATRICS: 'أطفال', ORTHOPEDIC: 'عظام', GENERAL_MEDICINE: 'طب عام' });
Object.assign(ar.DAY, { '0': 'الأحد', '1': 'الإثنين', '2': 'الثلاثاء', '3': 'الأربعاء', '4': 'الخميس', '5': 'الجمعة', '6': 'السبت' });
Object.assign(ar.STATUS, { SCHEDULED: 'مجدول', CONFIRMED: 'مؤكد', WAITING: 'انتظار', IN_PROGRESS: 'قيد التنفيذ', IN_CONSULTATION: 'في الاستشارة', COMPLETED: 'مكتمل', CANCELLED: 'ملغى', NO_SHOW: 'لم يحضر', ACTIVE: 'نشط', PENDING: 'معلق', PAID: 'مدفوع', PARTIAL: 'جزئي', REQUESTED: 'مطلوب', SAMPLE_COLLECTED: 'تم أخذ العينة', PROCESSING: 'قيد المعالجة', IN_SERVICE: 'قيد الخدمة', CALLED: 'تم الاستدعاء', SKIPPED: 'تم التخطي', APPROVED: 'موافق عليه', REJECTED: 'مرفوض', SUBMITTED: 'مقدم' });
Object.assign(ar.PAYMENT_METHOD, { CASH: 'نقد', CARD: 'بطاقة', INSURANCE: 'تأمين', MIXED: 'مختلط' });

w('clinic-frontend/src/assets/i18n/en.json', JSON.stringify(en, null, 2));
w('clinic-frontend/src/assets/i18n/ar.json', JSON.stringify(ar, null, 2));

// ========== Translate pipe ==========
w('clinic-frontend/src/app/shared/pipes/translate-key.pipe.ts', `import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Pipe({ name: 'tk', standalone: true, pure: false })
export class TranslateKeyPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);
  transform(value: unknown, prefix: string): string {
    if (value == null || value === '') return '';
    const key = prefix + '.' + String(value);
    const t = this.translate.instant(key);
    return t !== key ? t : String(value);
  }
}
`);

console.log('i18n + translate pipe done');
