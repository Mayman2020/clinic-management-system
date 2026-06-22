/**
 * Generates clinic-management-system backend + frontend scaffold.
 * Run: node scripts/generate-project.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PKG = 'com.clinicmanagement';
const PKG_PATH = PKG.replace(/\./g, '/');
const BE = path.join(ROOT, 'clinic-backend');
const FE = path.join(ROOT, 'clinic-frontend');
const JAVA = path.join(BE, 'src/main/java', PKG_PATH);
const RES = path.join(BE, 'src/main/resources');
const FE_APP = path.join(FE, 'src/app');

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function write(rel, content) {
  const full = path.join(ROOT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, 'utf8');
}

function replacePkg(code) {
  return code.replace(/com\.clinicmanagement/g, PKG);
}

const MODULES = [
  'patients', 'doctors', 'appointments', 'queue', 'consultation',
  'prescription', 'lab', 'radiology', 'billing', 'insurance', 'dashboard', 'settings'
];

const ROLES = ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGY_STAFF', 'CASHIER'];

const PERM_MODULES = [
  'dashboard', 'patients', 'doctors', 'appointments', 'queue', 'calendar',
  'consultation', 'prescription', 'lab', 'radiology', 'billing', 'insurance',
  'reports', 'settings', 'users', 'permissions'
];

const PERM_ACTIONS = ['enabled', 'menu', 'view', 'create', 'edit', 'delete', 'export', 'approve'];

function fullPerms(allTrue = true) {
  const mod = {};
  PERM_MODULES.forEach(m => {
    mod[m] = {};
    PERM_ACTIONS.forEach(a => { mod[m][a] = allTrue; });
  });
  return JSON.stringify(mod);
}

function rolePerms(role) {
  const base = {};
  PERM_MODULES.forEach(m => {
    base[m] = {};
    PERM_ACTIONS.forEach(a => { base[m][a] = false; });
  });
  const grant = (mods, actions = ['enabled', 'menu', 'view']) => {
    mods.forEach(m => {
      if (!base[m]) base[m] = {};
      actions.forEach(a => { base[m][a] = true; });
    });
  };
  switch (role) {
    case 'ADMIN':
      return fullPerms(true);
    case 'RECEPTIONIST':
      grant(['dashboard', 'patients', 'appointments', 'queue', 'calendar', 'billing'], PERM_ACTIONS.filter(a => a !== 'delete'));
      grant(['patients', 'appointments'], ['create', 'edit']);
      break;
    case 'DOCTOR':
      grant(['dashboard', 'patients', 'appointments', 'queue', 'calendar', 'consultation', 'prescription', 'lab', 'radiology']);
      grant(['consultation', 'prescription', 'lab', 'radiology'], ['create', 'edit']);
      break;
    case 'NURSE':
      grant(['dashboard', 'patients', 'queue', 'appointments', 'consultation']);
      grant(['queue', 'appointments'], ['edit']);
      break;
    case 'LAB_TECHNICIAN':
      grant(['dashboard', 'lab', 'patients']);
      grant(['lab'], ['create', 'edit', 'approve']);
      break;
    case 'RADIOLOGY_STAFF':
      grant(['dashboard', 'radiology', 'patients']);
      grant(['radiology'], ['create', 'edit', 'approve']);
      break;
    case 'CASHIER':
      grant(['dashboard', 'billing', 'insurance', 'patients']);
      grant(['billing', 'insurance'], ['create', 'edit', 'approve']);
      break;
  }
  return JSON.stringify(base);
}

// --- SQL Migrations ---
write('clinic-backend/src/main/resources/db/migration/V1__init_schema.sql', `-- V1: Clinic Management System schema
CREATE SCHEMA IF NOT EXISTS clinic_mgmt;

SET search_path TO clinic_mgmt;

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150),
    phone           VARCHAR(20),
    role            VARCHAR(30) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT FALSE,
    last_login      TIMESTAMP,
    last_login_ip   VARCHAR(45),
    created_by      BIGINT,
    created_on      TIMESTAMP,
    modified_by     BIGINT,
    modified_on     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE role_permissions (
    role              VARCHAR(30) PRIMARY KEY,
    permissions_json  TEXT NOT NULL,
    created_at        TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at        TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE revoked_tokens (
    id         BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
    id                  BIGSERIAL PRIMARY KEY,
    patient_code        VARCHAR(30) UNIQUE NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    national_id         VARCHAR(50),
    passport_number     VARCHAR(50),
    date_of_birth       DATE,
    gender              VARCHAR(10),
    phone               VARCHAR(20),
    email               VARCHAR(150),
    address             TEXT,
    emergency_contact_name  VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    medical_history     TEXT,
    allergies           TEXT,
    chronic_diseases    TEXT,
    insurance_provider_id BIGINT,
    insurance_policy_no VARCHAR(100),
    notes               TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_by          BIGINT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_patients_national_id ON patients(national_id) WHERE national_id IS NOT NULL AND national_id <> '';
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_active ON patients(is_active);

CREATE TABLE doctors (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT REFERENCES users(id),
    doctor_code         VARCHAR(30) UNIQUE NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    specialty           VARCHAR(50) NOT NULL,
    department          VARCHAR(100),
    phone               VARCHAR(20),
    email               VARCHAR(150),
    consultation_fee    NUMERIC(12,2) DEFAULT 0,
    bio                 TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);

CREATE TABLE doctor_schedules (
    id          BIGSERIAL PRIMARY KEY,
    doctor_id   BIGINT NOT NULL REFERENCES doctors(id),
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);

CREATE TABLE appointments (
    id              BIGSERIAL PRIMARY KEY,
    appointment_no  VARCHAR(30) UNIQUE NOT NULL,
    patient_id      BIGINT NOT NULL REFERENCES patients(id),
    doctor_id       BIGINT NOT NULL REFERENCES doctors(id),
    appointment_date DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME,
    status          VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    appointment_type VARCHAR(20) DEFAULT 'SCHEDULED',
    notes           TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_by      BIGINT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE TABLE queue_tokens (
    id              BIGSERIAL PRIMARY KEY,
    token_number    INTEGER NOT NULL,
    queue_date      DATE NOT NULL,
    doctor_id       BIGINT REFERENCES doctors(id),
    department      VARCHAR(100),
    patient_id      BIGINT REFERENCES patients(id),
    appointment_id  BIGINT REFERENCES appointments(id),
    status          VARCHAR(20) DEFAULT 'WAITING',
    estimated_wait_minutes INTEGER,
    called_at       TIMESTAMP,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_queue_token_day ON queue_tokens(queue_date, doctor_id, token_number);
CREATE INDEX idx_queue_status ON queue_tokens(status, queue_date);

CREATE TABLE consultations (
    id              BIGSERIAL PRIMARY KEY,
    appointment_id  BIGINT REFERENCES appointments(id),
    patient_id      BIGINT NOT NULL REFERENCES patients(id),
    doctor_id       BIGINT NOT NULL REFERENCES doctors(id),
    symptoms        TEXT,
    diagnosis       TEXT,
    notes           TEXT,
    treatment_plan  TEXT,
    follow_up_date  DATE,
    status          VARCHAR(20) DEFAULT 'IN_PROGRESS',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);

CREATE TABLE prescriptions (
    id              BIGSERIAL PRIMARY KEY,
    prescription_no VARCHAR(30) UNIQUE NOT NULL,
    consultation_id BIGINT REFERENCES consultations(id),
    patient_id      BIGINT NOT NULL REFERENCES patients(id),
    doctor_id       BIGINT NOT NULL REFERENCES doctors(id),
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id              BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name   VARCHAR(200) NOT NULL,
    dosage          VARCHAR(100),
    frequency       VARCHAR(100),
    duration        VARCHAR(100),
    notes           TEXT
);

CREATE TABLE lab_requests (
    id              BIGSERIAL PRIMARY KEY,
    request_no      VARCHAR(30) UNIQUE NOT NULL,
    patient_id      BIGINT NOT NULL REFERENCES patients(id),
    doctor_id       BIGINT REFERENCES doctors(id),
    test_type       VARCHAR(100) NOT NULL,
    test_category   VARCHAR(50),
    status          VARCHAR(30) DEFAULT 'REQUESTED',
    result_pdf_url  VARCHAR(500),
    notes           TEXT,
    requested_at    TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_lab_patient ON lab_requests(patient_id);
CREATE INDEX idx_lab_status ON lab_requests(status);

CREATE TABLE radiology_requests (
    id              BIGSERIAL PRIMARY KEY,
    request_no      VARCHAR(30) UNIQUE NOT NULL,
    patient_id      BIGINT NOT NULL REFERENCES patients(id),
    doctor_id       BIGINT REFERENCES doctors(id),
    study_type      VARCHAR(100) NOT NULL,
    status          VARCHAR(30) DEFAULT 'REQUESTED',
    scheduled_at    TIMESTAMP,
    report_text     TEXT,
    image_url       VARCHAR(500),
    notes           TEXT,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_radiology_patient ON radiology_requests(patient_id);

CREATE TABLE insurance_providers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    contact_phone   VARCHAR(20),
    contact_email   VARCHAR(150),
    coverage_notes  TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE claims (
    id              BIGSERIAL PRIMARY KEY,
    claim_no        VARCHAR(30) UNIQUE NOT NULL,
    patient_id      BIGINT NOT NULL REFERENCES patients(id),
    provider_id     BIGINT REFERENCES insurance_providers(id),
    invoice_id      BIGINT,
    amount          NUMERIC(12,2) NOT NULL,
    copayment       NUMERIC(12,2) DEFAULT 0,
    status          VARCHAR(30) DEFAULT 'PENDING',
    submitted_at    TIMESTAMP,
    approved_at     TIMESTAMP,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
    id              BIGSERIAL PRIMARY KEY,
    invoice_no      VARCHAR(30) UNIQUE NOT NULL,
    patient_id      BIGINT NOT NULL REFERENCES patients(id),
    status          VARCHAR(20) DEFAULT 'PENDING',
    subtotal        NUMERIC(12,2) DEFAULT 0,
    discount        NUMERIC(12,2) DEFAULT 0,
    tax             NUMERIC(12,2) DEFAULT 0,
    total           NUMERIC(12,2) DEFAULT 0,
    paid_amount     NUMERIC(12,2) DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);

CREATE TABLE invoice_items (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type       VARCHAR(50) NOT NULL,
    description     VARCHAR(300) NOT NULL,
    quantity        NUMERIC(10,2) DEFAULT 1,
    unit_price      NUMERIC(12,2) NOT NULL,
    total_price     NUMERIC(12,2) NOT NULL,
    reference_id    BIGINT
);

CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id),
    amount          NUMERIC(12,2) NOT NULL,
    payment_method  VARCHAR(30) NOT NULL,
    reference_no    VARCHAR(100),
    paid_at         TIMESTAMP DEFAULT NOW(),
    notes           TEXT,
    created_by      BIGINT
);

CREATE TABLE patient_documents (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    document_type   VARCHAR(50),
    uploaded_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100),
    entity_id       BIGINT,
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

ALTER TABLE patients ADD CONSTRAINT fk_patients_insurance FOREIGN KEY (insurance_provider_id) REFERENCES insurance_providers(id);
ALTER TABLE claims ADD CONSTRAINT fk_claims_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id);
`);

const roleInserts = ROLES.map(r => `('${r}', '${rolePerms(r).replace(/'/g, "''")}')`).join(',\n');
write('clinic-backend/src/main/resources/db/migration/V2__seed_roles.sql', `-- V2: Seed role permissions
SET search_path TO clinic_mgmt;
INSERT INTO role_permissions (role, permissions_json) VALUES
${roleInserts}
ON CONFLICT (role) DO NOTHING;
`);

write('clinic-backend/src/main/resources/db/migration/V3__seed_users.sql', `-- V3: Seed admin user (username=admin, password=admin123)
SET search_path TO clinic_mgmt;
-- BCrypt hash for admin123
INSERT INTO users (username, email, password_hash, full_name, role, is_active, must_change_password)
VALUES ('admin', 'admin@clinic.local',
'$2b$10$IXh3uclXYEBX0AiGQOzh6OHneA6fAFQOanEULz1TmAHUtCrv8RwGm',
'System Administrator', 'ADMIN', TRUE, FALSE)
ON CONFLICT (username) DO NOTHING;
`);

write('clinic-backend/src/main/resources/db/migration/V4__seed_demo_data.sql', `-- V4: Demo data
SET search_path TO clinic_mgmt;

INSERT INTO insurance_providers (name, contact_phone, contact_email, coverage_notes) VALUES
('National Health Insurance', '+966500000001', 'claims@nhi.example', 'Standard coverage 80%'),
('MediCare Plus', '+966500000002', 'support@medicare.example', 'Premium plan with dental')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (doctor_code, first_name, last_name, specialty, department, consultation_fee, email, phone) VALUES
('DOC-001', 'Ahmed', 'Hassan', 'GENERAL_MEDICINE', 'General Medicine', 150.00, 'ahmed.hassan@clinic.local', '+966511111111'),
('DOC-002', 'Sara', 'Ali', 'PEDIATRICS', 'Pediatrics', 175.00, 'sara.ali@clinic.local', '+966522222222'),
('DOC-003', 'Omar', 'Khalid', 'DENTAL', 'Dental', 200.00, 'omar.khalid@clinic.local', '+966533333333'),
('DOC-004', 'Layla', 'Nasser', 'DERMATOLOGY', 'Dermatology', 180.00, 'layla.nasser@clinic.local', '+966544444444')
ON CONFLICT (doctor_code) DO NOTHING;

INSERT INTO patients (patient_code, first_name, last_name, national_id, date_of_birth, gender, phone, email, allergies, chronic_diseases, insurance_provider_id, insurance_policy_no) VALUES
('PAT-001', 'Mohammed', 'Saleh', '1234567890', '1985-03-15', 'MALE', '+966555555551', 'm.saleh@email.com', 'Penicillin', 'Hypertension', 1, 'NHI-001234'),
('PAT-002', 'Fatima', 'Ahmed', '0987654321', '1992-07-22', 'FEMALE', '+966555555552', 'f.ahmed@email.com', NULL, 'Diabetes Type 2', 2, 'MCP-987654'),
('PAT-003', 'Khalid', 'Ibrahim', '1122334455', '2018-11-05', 'MALE', '+966555555553', NULL, 'Peanuts', NULL, 1, 'NHI-001235')
ON CONFLICT (patient_code) DO NOTHING;

INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES
(1, 0, '09:00', '17:00'), (1, 1, '09:00', '17:00'), (1, 2, '09:00', '17:00'),
(2, 0, '10:00', '16:00'), (2, 2, '10:00', '16:00'), (2, 4, '10:00', '16:00')
ON CONFLICT DO NOTHING;

INSERT INTO appointments (appointment_no, patient_id, doctor_id, appointment_date, start_time, end_time, status, appointment_type) VALUES
('APT-001', 1, 1, CURRENT_DATE, '10:00', '10:30', 'SCHEDULED', 'SCHEDULED'),
('APT-002', 2, 2, CURRENT_DATE, '11:00', '11:30', 'WAITING', 'SCHEDULED'),
('APT-003', 3, 3, CURRENT_DATE + 1, '09:30', '10:00', 'SCHEDULED', 'SCHEDULED')
ON CONFLICT (appointment_no) DO NOTHING;

INSERT INTO queue_tokens (token_number, queue_date, doctor_id, patient_id, appointment_id, status) VALUES
(1, CURRENT_DATE, 1, 1, 1, 'WAITING'),
(2, CURRENT_DATE, 1, 2, 2, 'WAITING')
ON CONFLICT DO NOTHING;
`);

console.log('SQL migrations generated');
