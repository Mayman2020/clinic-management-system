SET search_path TO clinic_mgmt;

ALTER TABLE users ADD COLUMN IF NOT EXISTS extra_roles VARCHAR(500);
