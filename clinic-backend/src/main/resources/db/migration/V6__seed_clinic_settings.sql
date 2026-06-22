-- V6: Seed default clinic settings
SET search_path TO clinic_mgmt;
INSERT INTO clinic_settings (setting_key, setting_value, description) VALUES
('clinic_name', 'Clinic Management System', 'Clinic display name'),
('clinic_phone', '+966 000 000 000', 'Clinic phone'),
('clinic_address', 'Main Street, City', 'Clinic address'),
('clinic_email', 'info@clinic.local', 'Clinic email')
ON CONFLICT (setting_key) DO NOTHING;
