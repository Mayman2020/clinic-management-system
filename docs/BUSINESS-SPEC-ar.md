# المواصفات التجارية — نظام العيادة (Business Spec)

**الإصدار:** 1.0 · **2026-06-28**

---

## 1. الغرض

نظام إدارة عيادة متعددة الفروع: استقبال، مواعيد، استشارات، مختبر، أشعة، فواتير، تأمين، مستخدمون وصلاحيات.

---

## 2. الأدوار

| Role | الوصف |
|------|--------|
| ADMIN | إعدادات، مستخدمون، تقارير |
| RECEPTIONIST | مواعيد، استقبال، queue |
| DOCTOR | استشارات، وصفات |
| NURSE | مساعدة سريرية |
| LAB_TECHNICIAN | طلبات مختبر |
| RADIOLOGY_STAFF | طلبات أشعة |
| CASHIER | فواتير ومدفوعات |

---

## 3. Workflows رئيسية

### 3.1 رحلة المريض

```mermaid
flowchart LR
  Register[تسجيل مريض] --> Appt[حجز موعد]
  Appt --> Queue[Queue اليوم]
  Queue --> Consult[استشارة]
  Consult --> Rx[وصفة / Lab / Radiology]
  Rx --> Bill[فاتورة + دفع]
```

### 3.2 القوائم الإدارية (Property-style)

كل قائمة admin تعرض:
- KPI stat-pills من API
- بحث + فلاتر في `estate-table-toolbar`
- جدول paginated
- empty-state عند عدم وجود بيانات

---

## 4. Acceptance Criteria مجمّعة

| المجال | Given | When | Then |
|--------|-------|------|------|
| Patients | مستخدم بصلاحية view | يبحث أو يفلتر active | النتائج من الخادم مع totalElements |
| Appointments | مواعيد موجودة | يفلتر status | القائمة تتحدث بدون client filter |
| Billing | فواتير | يبحث q | API 200 + pager |
| Audit | سجلات | يبحث q | server search عبر الصفحات |
| Prescriptions | وصفات | يفتح القائمة | يظهر اسم المريض |

---

## 5. حالة الفجوات

| Closed (2026-06-28) | Open |
|---------------------|------|
| **All B1–B10, T1–T10** | — |

راجع `docs/business-gaps-ar.md` للتفاصيل.

---

## 6. نتائج الاختبار

| نوع | النتيجة |
|-----|---------|
| API smoke | **26/26** |
| User stories | **43/43 Pass** |

التفاصيل: `docs/user-stories-test-results-ar.md`

---

## 7. User Stories Reference

43 user story في `docs/user-stories-full-system-ar.md` — Epics 01–12.
