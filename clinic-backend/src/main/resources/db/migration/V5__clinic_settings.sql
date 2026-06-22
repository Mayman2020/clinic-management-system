-- V5: Clinic settings key-value store
SET search_path TO clinic_mgmt;
CREATE TABLE IF NOT EXISTS clinic_settings (
    id              BIGSERIAL PRIMARY KEY,
    setting_key     VARCHAR(100) UNIQUE NOT NULL,
    setting_value   TEXT,
    description     VARCHAR(500),
    updated_at      TIMESTAMP DEFAULT NOW()
);
