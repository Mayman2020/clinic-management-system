-- V1: Clinic Management System schema
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
