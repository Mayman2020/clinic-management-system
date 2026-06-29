SET search_path TO clinic_mgmt;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_consultation_id
    ON invoices(consultation_id) WHERE consultation_id IS NOT NULL;

UPDATE users SET must_change_password = TRUE WHERE username = 'admin' AND must_change_password = FALSE;

DELETE FROM role_permissions WHERE role <> 'ADMIN';
