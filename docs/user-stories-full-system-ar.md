# وثيقة User Stories الشاملة — نظام إدارة العيادة
## Complete User Stories & Test Specification

**التاريخ:** 2026-06-28  
**الإصدار:** 1.0  
**الغرض:** مرجع اختبار شامل (يدوي + smoke API) يغطي كل شاشة وكل تدفّق في النظام.  
**البيئة:** Frontend `http://localhost:4200` · Backend `http://localhost:8086/api/v1` · DB schema `clinic_mgmt`

---

## كيف تُقرأ هذه الوثيقة

كل **Epic** = موديول/مجال في النظام.  
كل **User Story** بالصيغة:

> **US-XXX** — كـ «دور»، أريد أن «أفعل شيئاً»، حتى «أحقق هدفاً».

ويتبعها:
- **الشاشة / المسار** (Route)
- **الـ API** المستخدم
- **معايير القبول** (Acceptance Criteria) بصيغة Given/When/Then
- **النتيجة** ☐ Pass ☐ Fail

**رموز الأدوار:** AD = ADMIN · RC = RECEPTIONIST · DR = DOCTOR · NR = NURSE · LT = LAB_TECHNICIAN · RS = RADIOLOGY_STAFF · CS = CASHIER

---

## بيانات الدخول الافتراضية

| الحقل | القيمة |
|-------|--------|
| المستخدم | `admin` |
| كلمة المرور | `Dev@Local2026!` |

---

# EPIC 01 — المصادقة والحساب (Auth)

### US-001 — تسجيل الدخول
> كـ مستخدم، أريد تسجيل الدخول باسم المستخدم وكلمة المرور، حتى أصل إلى لوحة العيادة.

- **المسار:** `/auth/login`
- **API:** `POST /auth/login`
- **معايير القبول:**
  - Given بيانات صحيحة، When أضغط دخول، Then أُوجَّه إلى `/admin/dashboard`.
  - Given بيانات خاطئة، Then تظهر رسالة خطأ ولا يتم الدخول.
  - Given `mustChangePassword=true`، Then أُوجَّه إلى `/change-password`.
- ☐ Pass ☐ Fail

### US-002 — تغيير كلمة المرور الإلزامي
> كـ مستخدم جديد، أريد تغيير كلمة المرور عند أول دخول، حتى أؤمّن حسابي.

- **المسار:** `/change-password`
- **API:** `POST /users/me/change-password`
- **معايير القبول:** Given كلمة مرور جديدة صالحة، When أحفظ، Then يُلغى `mustChangePassword` ويعمل الدخول التالي.
- ☐ Pass ☐ Fail

### US-003 — الملف الشخصي
> كـ أي مستخدم، أريد عرض/تعديل بياناتي، حتى تبقى محدّثة.

- **المسار:** `/admin/profile`
- **API:** `GET /users/me` · `PUT /users/me`
- **معايير القبول:** Given تعديل الاسم أو الهاتف، When أحفظ، Then تظهر البيانات بعد إعادة التحميل.
- ☐ Pass ☐ Fail

### US-004 — تسجيل الخروج
> كـ مستخدم، أريد الخروج، حتى أنهي الجلسة بأمان.

- **معايير القبول:** Given جلسة نشطة، When أخرج، Then يُمسح التوكن وتُمنع المسارات المحمية.
- ☐ Pass ☐ Fail

---

# EPIC 02 — لوحة التحكم (Dashboard)

### US-010 — عرض KPIs الرئيسية
> كـ AD، أريد رؤية إحصائيات اليوم (مواعيد، مرضى، إيراد)، حتى أتابع أداء العيادة.

- **المسار:** `/admin/dashboard`
- **API:** `GET /dashboard/stats`
- **معايير القbول:**
  - Given بيانات seed، When أفتح اللوحة، Then تظهر الأرقام بدون خطأ 404/500.
  - Given فرع محدد في الهيدر، Then تُحمَّل الإحصائيات للفرع.
- ☐ Pass ☐ Fail

### US-011 — الإشعارات غير المقروءة
> كـ مستخدم، أريد عداد الإشعارات في الشريط العلوي، حتى أعرف ما يحتاج متابعتي.

- **API:** `GET /notifications/my/unread-count`
- **معايير القبول:** Given إشعارات جديدة، When أفتح التطبيق، Then يظهر العدد الصحيح.
- ☐ Pass ☐ Fail

### US-012 — قائمة الإشعارات
> كـ مستخدم، أريد عرض إشعاراتي وتحديدها كمقروءة.

- **المسار:** `/admin/notifications`
- **API:** `GET /notifications/my?page=0&size=10`
- **معايير القبول:** Given إشعارات، When أفتح الصفحة، Then تظهر مرتبة بالأحدث.
- ☐ Pass ☐ Fail

---

# EPIC 03 — المرضى (Patients)

### US-020 — قائمة المرضى مع بحث وتصفية
> كـ RC/AD، أريد عرض المرضى مع pagination وبحث وفلتر نشط، حتى أدير السجل.

- **المسار:** `/admin/patients`
- **API:** `GET /patients?page=0&size=10&q=&active=`
- **معايير القبول:**
  - Given مرضى في النظام، When أفتح القائمة، Then تظهر stat-pill بعدد `totalElements`.
  - Given بحث `?q=test`، When أبحث، Then النتائج من الخادم وليس فلترة عميل.
  - Given فلتر نشط، When أطبّق، Then تظهر المرضى النشطون فقط.
- ☐ Pass ☐ Fail

### US-021 — إضافة مريض
> كـ RC، أريد إضافة مريض جديد، حتى أسجّله للمواعيد.

- **API:** `POST /patients`
- **معايير القبول:** Given حقول مطلوبة، When أحفظ، Then يظهر المريض في القائمة برمز فريد.
- ☐ Pass ☐ Fail

### US-022 — تعديل مريض
> كـ RC، أريد تعديل بيانات مريض، حتى أصحّح الأخطاء.

- **API:** `PUT /patients/{id}`
- **معايير القبول:** Given مريض موجود، When أعدّل الهاتف، Then يُحفظ ويظهر في القائمة.
- ☐ Pass ☐ Fail

### US-023 — أرشفة مريض
> كـ AD، أريد أرشفة مريض، حتى لا يظهر في القائمة الافتراضية.

- **API:** `POST /patients/{id}/archive`
- **معايير القبول:** Given مريض نشط، When أؤرشف، Then `active=false` ولا يظهر بفلتر النشط.
- ☐ Pass ☐ Fail

### US-024 — ملف المريض 360
> كـ DR، أريد عرض تاريخ المريض الكامل، حتى أتخذ قرارات طبية.

- **المسار:** `/admin/patients/:id`
- **API:** `GET /patients/{id}` · `GET /appointments/patient/{id}` · `GET /consultations/patient/{id}`
- **معايير القبول:** Given مريض له مواعيد واستشارات، When أفتح 360، Then تظهر التبويبات.
- ☐ Pass ☐ Fail

---

# EPIC 04 — الأطباء (Doctors)

### US-030 — قائمة الأطباء
> كـ AD، أريد عرض الأطباء مع بحث، حتى أدير الكادر الطبي.

- **المسار:** `/admin/doctors`
- **API:** `GET /doctors?page=0&size=10&q=`
- **معايير القبول:** Given أطباء، When أفتح القائمة، Then pager وبحث يعملان.
- ☐ Pass ☐ Fail

### US-031 — إضافة/تعديل طبيب
> كـ AD، أريد إضافة طبيب بتخصص، حتى يُحجز له موعد.

- **API:** `POST /doctors` · `PUT /doctors/{id}`
- **معايير القبول:** Given تخصص من LOOKUP، When أحفظ، Then يظهر الطبيب في القائمة والحجز.
- ☐ Pass ☐ Fail

### US-032 — ملف الطبيب
> كـ AD، أريد عرض ملف الطبيب وجدوله.

- **المسار:** `/admin/doctors/:id`
- **API:** `GET /doctors/{id}`
- **معايير القبول:** Given طبيب، When أفتح الملف، Then تظهر بياناته وتخصصه.
- ☐ Pass ☐ Fail

---

# EPIC 05 — المواعيد (Appointments)

### US-040 — قائمة المواعيد مع فلتر الحالة
> كـ RC، أريد عرض المواعيد مع بحث وفلتر حالة، حتى أتابع اليوم.

- **المسار:** `/admin/appointments`
- **API:** `GET /appointments?page=0&size=10&status=&q=`
- **معايير القبول:**
  - Given مواعيد متعددة الحالات، When أفلتر SCHEDULED، Then النتائج من الخادم.
  - Given pager، When أغيّر الصفحة، Then `totalElements` ثابت من API.
- ☐ Pass ☐ Fail

### US-041 — حجز موعد
> كـ RC، أريد حجز موعد لمريض وطبيب، حتى يحضر في الوقت المحدد.

- **API:** `POST /appointments/book`
- **معايير القبول:** Given مريض وطبيب ووقت، When أحجز، Then status=SCHEDULED ويظهر في القائمة.
- ☐ Pass ☐ Fail

### US-042 — Walk-in
> كـ RC، أريد تسجيل walk-in، حتى يدخل المريض الطابور مباشرة.

- **API:** `POST /appointments/walk-in`
- **معايير القبول:** Given مريض بدون موعد، When walk-in، Then يُنشأ موعد وtoken طابور.
- ☐ Pass ☐ Fail

### US-043 — تأكيد وإلغاء موعد
> كـ RC، أريد تأكيد أو إلغاء موعد، حتى يُحدَّث الحالة.

- **API:** `POST /appointments/{id}/confirm` · `POST /appointments/{id}/cancel`
- **معايير القبول:** Given موعد SCHEDULED، When أؤكد، Then status=CONFIRMED.
- ☐ Pass ☐ Fail

### US-044 — Check-in وبدء الاستشارة
> كـ RC/DR، أريد check-in ثم بدء الاستشارة.

- **API:** `POST /appointments/{id}/check-in`
- **المسار:** `/admin/consultation/new?patientId=&doctorId=&appointmentId=`
- **معايير القبول:** Given موعد CONFIRMED، When check-in، Then يظهر token الطابور.
- ☐ Pass ☐ Fail

---

# EPIC 06 — الفواتير والمدفوعات (Billing)

### US-050 — قائمة الفواتير مع فلتر الحالة
> كـ CS، أريد عرض الفواتير مع بحث وفلتر status، حتى أتابع التحصيل.

- **المسار:** `/admin/billing`
- **API:** `GET /billing/invoices?page=0&size=10&status=&q=`
- **معايير القbول:** Given فواتير PAID/PENDING، When أفلتر PENDING، Then النتائج من الخادم.
- ☐ Pass ☐ Fail

### US-051 — إنشاء فاتورة
> كـ CS، أريد إنشاء فاتورة لاستشارة، حتى أحصّل المبلغ.

- **API:** `POST /billing/invoices`
- **معايير القبول:** Given استشارة مكتملة، When أنشئ فاتورة، Then تظهر في القائمة.
- ☐ Pass ☐ Fail

### US-052 — تسجيل دفعة
> كـ CS، أريد تسجيل دفعة على فاتورة، حتى تُحدَّث الحالة إلى PAID.

- **API:** `POST /billing/invoices/{id}/payments/mixed`
- **معايير القبول:** Given فاتورة PENDING، When أدفع كامل المبلغ، Then status=PAID.
- ☐ Pass ☐ Fail

### US-053 — قائمة المدفوعات
> كـ CS، أريد عرض سجل المدفوعات مع بحث.

- **المسار:** `/admin/billing/payments`
- **API:** `GET /billing/payments?page=0&size=10`
- **معايير القبول:** Given مدفوعات، When أفتح الصفحة، Then pager وstat-pill يعملان.
- ☐ Pass ☐ Fail

### US-054 — طباعة/PDF فاتورة
> كـ CS، أريد طباعة أو تنزيل PDF للفاتورة.

- **API:** `GET /billing/invoices/{id}/print` · `GET /billing/invoices/{id}/pdf`
- **معايير القبول:** Given فاتورة، When أطبع، Then تظهر بيانات المريض والمبلغ.
- ☐ Pass ☐ Fail

---

# EPIC 07 — المختبر (Lab)

### US-060 — قائمة طلبات المختبر
> كـ LT، أريد عرض طلبات التحاليل مع pagination.

- **المسار:** `/admin/lab`
- **API:** `GET /lab/requests?page=0&size=10&q=`
- **معايير القبول:** Given طلبات، When أفتح القائمة، Then تظهر الحالة ونوع التحليل.
- ☐ Pass ☐ Fail

### US-061 — إنشاء طلب مختبر
> كـ DR، أريد طلب تحليل لمريض، حتى يُجرى في المختبر.

- **API:** `POST /lab/requests`
- **معايير القبول:** Given مريض واستشارة، When أنشئ طلب، Then status=REQUESTED.
- ☐ Pass ☐ Fail

### US-062 — إدخال نتيجة تحليل
> كـ LT، أريد إدخال نتيجة التحليل، حتى يراها الطبيب.

- **API:** `PUT /lab/requests/{id}/result`
- **معايير القبول:** Given طلب REQUESTED، When أدخل النتيجة، Then status=COMPLETED.
- ☐ Pass ☐ Fail

---

# EPIC 08 — الأشعة (Radiology)

### US-070 — قائمة طلبات الأشعة
> كـ RS، أريد عرض طلبات الأشعة.

- **المسار:** `/admin/radiology`
- **API:** `GET /radiology/requests?page=0&size=10&q=`
- **معايير القبول:** Given طلبات، When أفتح القائمة، Then pager يعمل.
- ☐ Pass ☐ Fail

### US-071 — إنشاء طلب أشعة
> كـ DR، أريد طلب أشعة لمريض.

- **API:** `POST /radiology/requests`
- **معايير القبول:** Given مريض، When أنشئ طلب، Then يظهر في قائمة الأشعة.
- ☐ Pass ☐ Fail

### US-072 — إدخال تقرير أشعة
> كـ RS، أريد إدخال تقرير الأشعة.

- **API:** `PUT /radiology/requests/{id}/report`
- **معايير القبول:** Given طلب PENDING، When أرفق التقرير، Then status=COMPLETED.
- ☐ Pass ☐ Fail

---

# EPIC 09 — التأمين (Insurance)

### US-080 — قائمة شركات التأمين
> كـ AD، أريد إدارة شركات التأمين.

- **المسار:** `/admin/insurance`
- **API:** `GET /insurance/providers?page=0&size=10`
- **معايير القبول:** Given شركات، When أفتح القائمة، Then CRUD يعمل.
- ☐ Pass ☐ Fail

### US-081 — تقديم مطالبة تأمين
> كـ CS، أريد تقديم مطالبة مرتبطة بفاتورة.

- **API:** `POST /insurance/claims`
- **معايير القبول:** Given فاتورة غير مدفوعة، When أقدّم مطالبة، Then تُسجَّل المطالبة.
- ☐ Pass ☐ Fail

### US-082 — موافقة/رفض مطالبة
> كـ AD، أريد الموافقة على مطالبة تأمين.

- **API:** `POST /insurance/claims/{id}/approve` · `POST /insurance/claims/{id}/reject`
- **معايير القبول:** Given مطالبة PENDING، When أوافق، Then status=APPROVED.
- ☐ Pass ☐ Fail

---

# EPIC 10 — المستخدمون والصلاحيات (Users & Permissions)

### US-090 — قائمة المستخدمين مع فلتر الدور
> كـ AD، أريد عرض المستخدمين مع بحث وفلتر role.

- **المسار:** `/admin/users`
- **API:** `GET /users?page=0&size=10&q=&role=`
- **معايير القbول:** Given مستخدمون بأدوار مختلفة، When أفلتر DOCTOR، Then النتائج من الخادم.
- ☐ Pass ☐ Fail

### US-091 — إنشاء مستخدم
> كـ AD، أريد إنشاء مستخدم بدور محدد.

- **API:** `POST /users`
- **معايير القbول:** Given بيانات صحيحة، When أحفظ، Then يستطيع المستخدم الدخول.
- ☐ Pass ☐ Fail

### US-092 — تفعيل/تعطيل مستخدم
> كـ AD، أريد تعطيل مستخدم، حتى لا يدخل.

- **API:** `POST /users/{id}/toggle-active`
- **معايير القبول:** Given مستخدم نشط، When أعطّل، Then `isActive=false` ويفشل الدخول.
- ☐ Pass ☐ Fail

### US-093 — مصفوفة الصلاحيات
> كـ AD، أريد تعديل صلاحيات كل دور.

- **المسار:** `/admin/permissions`
- **API:** `GET /role-permissions` · `PUT /role-permissions/{role}`
- **معايير القبول:** Given دور RECEPTIONIST، When أزيل create للمرضى، Then يختفي زر الإضافة.
- ☐ Pass ☐ Fail

### US-094 — صلاحياتي
> كـ أي مستخدم، أريد تحميل صلاحياتي عند بدء التطبيق.

- **API:** `GET /role-permissions/me`
- **معايير القبول:** Given JWT صالح، When APP_INITIALIZER، Then `PermissionService` جاهز.
- ☐ Pass ☐ Fail

---

# EPIC 11 — القوائم المرجعية (Lookups)

### US-100 — إدارة LOOKUPs
> كـ AD، أريد إدارة القوائم المرجعية (تخصصات، أنواع، …).

- **المسار:** `/admin/lookups`
- **API:** `GET /lookups/admin/by-type?type=SPECIALTY`
- **معايير القبول:** Given نوع SPECIALTY، When أفتح الإدارة، Then CRUD يعمل.
- ☐ Pass ☐ Fail

### US-101 — LOOKUP عام للنماذج
> كـ مستخدم، أريد LOOKUPs للنماذج (dropdowns).

- **API:** `GET /lookups/by-type?type=SPECIALTY`
- **معايير القبول:** Given نوع صالح، When أطلب، Then قائمة العناصر النشطة فقط.
- ☐ Pass ☐ Fail

---

# EPIC 12 — سجل التدقيق (Audit)

### US-110 — قائمة سجل التدقيق مع بحث خادم
> كـ AD، أريد عرض سجل العمليات مع بحث server-side.

- **المسار:** `/admin/audit-logs`
- **API:** `GET /audit-logs?page=0&size=20&q=`
- **معايير القبول:**
  - Given سجلات، When أفتح القائمة، Then `ListLoadController` + empty-state.
  - Given `?q=CREATE`، When أبحث، Then النتائج من الخادم (action/entityType/details/entityId).
  - Given pager، When أغيّر الصفحة، Then لا client-filter على الصفحة.
- ☐ Pass ☐ Fail

### US-111 — تسجيل عملية تلقائي
> كـ النظام، أريد تسجيل CREATE/UPDATE/DELETE تلقائياً.

- **API:** (via `@Auditable` aspect)
- **معايير القbول:** Given إنشاء مريض، When أحفظ، Then يظهر سجل CREATE في audit-logs.
- ☐ Pass ☐ Fail

---

## ملخص التغطية

| Epic | عدد US |
|------|--------|
| Auth | 4 |
| Dashboard | 3 |
| Patients | 5 |
| Doctors | 3 |
| Appointments | 5 |
| Billing | 5 |
| Lab | 3 |
| Radiology | 3 |
| Insurance | 3 |
| Users & Permissions | 5 |
| Lookups | 2 |
| Audit | 2 |
| **المجموع** | **43** |

> يمكن إضافة US-012b (التقارير) و US-013 (الطابور) لبلوغ ~45 عند توسيع نطاق الاختبار.

---

## تشغيل الاختبار الآلي

```bash
# Backend على 8086
cd clinic-frontend && npm run test:api
```

**نتائج:** سجّل في `docs/user-stories-test-results-ar.md` (يُنشأ لاحقاً).
