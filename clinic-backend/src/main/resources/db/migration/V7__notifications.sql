-- V7: In-app notifications
SET search_path TO clinic_mgmt;
CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGSERIAL PRIMARY KEY,
    recipient_user_id   BIGINT NOT NULL,
    actor_user_id       BIGINT,
    type                VARCHAR(80) NOT NULL,
    title_key           VARCHAR(200) NOT NULL,
    body_key            VARCHAR(200) NOT NULL,
    vars_json           TEXT,
    reference_type      VARCHAR(80),
    reference_id        BIGINT,
    read_at             TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id, created_at DESC);
