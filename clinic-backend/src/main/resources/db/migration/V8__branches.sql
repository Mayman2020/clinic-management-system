-- V8: Multi-branch support (single default branch for existing installs)
SET search_path TO clinic_mgmt;

CREATE TABLE branches (
    id              BIGSERIAL PRIMARY KEY,
    branch_code     VARCHAR(30) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    address         TEXT,
    phone           VARCHAR(30),
    email           VARCHAR(150),
    is_default      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO branches (branch_code, name, address, is_default, is_active)
VALUES ('MAIN', 'Main Clinic', 'Head office', TRUE, TRUE);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id);
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id);
ALTER TABLE queue_tokens ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id);

UPDATE appointments SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE consultations SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE queue_tokens SET branch_id = 1 WHERE branch_id IS NULL;
UPDATE invoices SET branch_id = 1 WHERE branch_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_branch ON appointments(branch_id);
CREATE INDEX IF NOT EXISTS idx_consultations_branch ON consultations(branch_id);
CREATE INDEX IF NOT EXISTS idx_queue_tokens_branch ON queue_tokens(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_branch ON invoices(branch_id);

INSERT INTO clinic_settings (setting_key, setting_value, description)
VALUES ('multi_branch_enabled', 'false', 'Enable multi-branch mode (true/false)')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO clinic_settings (setting_key, setting_value, description) VALUES
('sms_enabled', 'false', 'Enable SMS notifications'),
('sms_provider', 'none', 'SMS provider: none, twilio, http'),
('sms_twilio_account_sid', '', 'Twilio Account SID'),
('sms_twilio_auth_token', '', 'Twilio Auth Token'),
('sms_twilio_from_number', '', 'Twilio sender phone number'),
('sms_http_url', '', 'Local SMS gateway HTTP endpoint URL'),
('sms_http_api_key', '', 'Optional API key header for SMS gateway')
ON CONFLICT (setting_key) DO NOTHING;
