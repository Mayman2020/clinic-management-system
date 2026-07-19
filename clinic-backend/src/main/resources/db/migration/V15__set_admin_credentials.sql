SET search_path TO clinic_mgmt;
UPDATE users SET username = 'admin', password_hash = '$2b$10$49wu0oR2J3vEOrZkEGsLMuLFpKEt3nrQ9pnquwuvfZu2ceMvriOnq', is_active = TRUE, must_change_password = FALSE
WHERE role = 'ADMIN' AND username = 'admin';
