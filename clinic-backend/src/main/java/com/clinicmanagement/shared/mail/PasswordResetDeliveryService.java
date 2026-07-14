package com.clinicmanagement.shared.mail;

import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.shared.sms.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Password reset via email (primary) and optional SMS when clinic SMS provider is configured.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetDeliveryService {

    private final EmailService emailService;
    private final SmsService smsService;

    @Value("${clinic.password-reset.base-url:}")
    private String resetBaseUrl;

    public void deliver(User user, String token) {
        if (user == null || token == null || token.isBlank()) {
            return;
        }
        String resetLink = buildResetLink(token);
        boolean emailSent = false;
        boolean smsSent = false;

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            String subject = "Clinic password reset";
            String body = """
                    A password reset was requested for account "%s".

                    Open this link within 24 hours:
                    %s

                    If you did not request this, ignore this message.
                    """.formatted(user.getUsername(), resetLink);
            emailSent = emailService.sendOptional(user.getEmail(), subject, body);
        }

        if (user.getPhone() != null && !user.getPhone().isBlank() && smsService.isEnabled()) {
            String smsBody = "Clinic password reset link: " + resetLink;
            smsService.sendOptional(user.getPhone(), smsBody);
            smsSent = true;
        }

        if (!emailSent && !smsSent) {
            log.info("Password reset for user {} (mail/SMS off) - token for dev: {}", user.getUsername(), token);
            log.debug("Password reset link: {}", resetLink);
        }
    }

    private String buildResetLink(String token) {
        String base = resetBaseUrl != null ? resetBaseUrl.trim() : "";
        if (base.isEmpty()) {
            return token;
        }
        String separator = base.contains("?") ? "&" : "?";
        return base + separator + "token=" + token;
    }
}
