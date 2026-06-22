-- V4: Demo data
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
