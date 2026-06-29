SET search_path TO clinic_mgmt;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS consultation_id BIGINT REFERENCES consultations(id);
CREATE INDEX IF NOT EXISTS idx_invoices_consultation ON invoices(consultation_id);

ALTER TABLE lab_requests ADD COLUMN IF NOT EXISTS consultation_id BIGINT REFERENCES consultations(id);
ALTER TABLE radiology_requests ADD COLUMN IF NOT EXISTS consultation_id BIGINT REFERENCES consultations(id);

CREATE INDEX IF NOT EXISTS idx_lab_consultation ON lab_requests(consultation_id);
CREATE INDEX IF NOT EXISTS idx_radiology_consultation ON radiology_requests(consultation_id);
