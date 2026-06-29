-- V13: Lookups reference data (PostgreSQL)
SET search_path TO clinic_mgmt;

CREATE TABLE IF NOT EXISTS lookups (
    id          BIGSERIAL PRIMARY KEY,
    type        VARCHAR(50) NOT NULL,
    code        VARCHAR(50) NOT NULL,
    name_ar     VARCHAR(150) NOT NULL,
    name_en     VARCHAR(150) NOT NULL,
    parent_id   BIGINT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_lookup_type_code UNIQUE (type, code)
);

CREATE INDEX IF NOT EXISTS idx_lookups_type_active ON lookups (type, is_active, sort_order);

-- Specialties (codes match Specialty enum)
INSERT INTO lookups (type, code, name_ar, name_en, sort_order, is_locked) VALUES
('SPECIALTY', 'GENERAL_MEDICINE', 'طب عام', 'General Medicine', 1, TRUE),
('SPECIALTY', 'PEDIATRICS', 'أطفال', 'Pediatrics', 2, TRUE),
('SPECIALTY', 'DENTAL', 'أسنان', 'Dental', 3, TRUE),
('SPECIALTY', 'DERMATOLOGY', 'جلدية', 'Dermatology', 4, TRUE),
('SPECIALTY', 'CARDIOLOGY', 'قلب', 'Cardiology', 5, TRUE),
('SPECIALTY', 'ORTHOPEDICS', 'عظام', 'Orthopedics', 6, TRUE),
('SPECIALTY', 'OPHTHALMOLOGY', 'عيون', 'Ophthalmology', 7, TRUE),
('SPECIALTY', 'ENT', 'أنف وأذن وحنجرة', 'ENT', 8, TRUE),
('SPECIALTY', 'GYNECOLOGY', 'نساء وتوليد', 'Gynecology', 9, TRUE),
('SPECIALTY', 'NEUROLOGY', 'أعصاب', 'Neurology', 10, TRUE),
('SPECIALTY', 'PSYCHIATRY', 'نفسية', 'Psychiatry', 11, TRUE),
('SPECIALTY', 'UROLOGY', 'مسالك بولية', 'Urology', 12, TRUE),
('SPECIALTY', 'OTHER', 'أخرى', 'Other', 99, TRUE);

INSERT INTO lookups (type, code, name_ar, name_en, sort_order) VALUES
('DEPARTMENT', 'OUTPATIENT', 'العيادات الخارجية', 'Outpatient', 1),
('DEPARTMENT', 'EMERGENCY', 'الطوارئ', 'Emergency', 2),
('DEPARTMENT', 'SURGERY', 'الجراحة', 'Surgery', 3),
('DEPARTMENT', 'INTERNAL', 'الباطنة', 'Internal Medicine', 4),
('DEPARTMENT', 'PEDIATRICS_DEPT', 'قسم الأطفال', 'Pediatrics Department', 5),
('DEPARTMENT', 'LAB_DEPT', 'المختبر', 'Laboratory', 6),
('DEPARTMENT', 'RADIOLOGY_DEPT', 'الأشعة', 'Radiology', 7);

INSERT INTO lookups (type, code, name_ar, name_en, sort_order) VALUES
('LAB_TEST_TYPE', 'CBC', 'صورة دم كاملة', 'Complete Blood Count', 1),
('LAB_TEST_TYPE', 'LIPID', 'دهون الدم', 'Lipid Profile', 2),
('LAB_TEST_TYPE', 'GLUCOSE', 'سكر الدم', 'Blood Glucose', 3),
('LAB_TEST_TYPE', 'HBA1C', 'السكر التراكمي', 'HbA1c', 4),
('LAB_TEST_TYPE', 'LFT', 'وظائف الكبد', 'Liver Function', 5),
('LAB_TEST_TYPE', 'RFT', 'وظائف الكلى', 'Renal Function', 6),
('LAB_TEST_TYPE', 'THYROID', 'الغدة الدرقية', 'Thyroid Panel', 7),
('LAB_TEST_TYPE', 'URINE', 'تحليل بول', 'Urinalysis', 8);

INSERT INTO lookups (type, code, name_ar, name_en, sort_order) VALUES
('LAB_TEST_CATEGORY', 'HEMATOLOGY', 'أمراض الدم', 'Hematology', 1),
('LAB_TEST_CATEGORY', 'BIOCHEMISTRY', 'كيمياء حيوية', 'Biochemistry', 2),
('LAB_TEST_CATEGORY', 'MICROBIOLOGY', 'أحياء دقيقة', 'Microbiology', 3),
('LAB_TEST_CATEGORY', 'IMMUNOLOGY', 'مناعة', 'Immunology', 4);

INSERT INTO lookups (type, code, name_ar, name_en, sort_order) VALUES
('RADIOLOGY_STUDY_TYPE', 'XRAY', 'أشعة سينية', 'X-Ray', 1),
('RADIOLOGY_STUDY_TYPE', 'CT', 'أشعة مقطعية', 'CT Scan', 2),
('RADIOLOGY_STUDY_TYPE', 'MRI', 'رنين مغناطيسي', 'MRI', 3),
('RADIOLOGY_STUDY_TYPE', 'ULTRASOUND', 'موجات فوق صوتية', 'Ultrasound', 4),
('RADIOLOGY_STUDY_TYPE', 'MAMMOGRAPHY', 'ماموجرام', 'Mammography', 5);

INSERT INTO lookups (type, code, name_ar, name_en, sort_order, is_locked) VALUES
('PAYMENT_METHOD', 'CASH', 'نقدي', 'Cash', 1, TRUE),
('PAYMENT_METHOD', 'CARD', 'بطاقة', 'Card', 2, TRUE),
('PAYMENT_METHOD', 'INSURANCE', 'تأمين', 'Insurance', 3, TRUE),
('PAYMENT_METHOD', 'TRANSFER', 'تحويل', 'Bank Transfer', 4, FALSE);
