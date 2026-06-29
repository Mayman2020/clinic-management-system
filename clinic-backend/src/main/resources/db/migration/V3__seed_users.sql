-- V3: Seed admin user (username=admin, password=admin123)
SET search_path TO clinic_mgmt;
INSERT INTO users (username, email, password_hash, full_name, role, is_active, must_change_password)
VALUES ('admin', 'admin@clinic.local',
'$2b$10$IXh3uclXYEBX0AiGQOzh6OHneA6fAFQOanEULz1TmAHUtCrv8RwGm',
'System Administrator', 'ADMIN', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;
