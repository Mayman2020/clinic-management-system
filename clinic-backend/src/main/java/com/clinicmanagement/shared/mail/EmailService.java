package com.clinicmanagement.shared.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor @Slf4j
public class EmailService {
    private final ObjectProvider<JavaMailSender> mailSender;

    @Value("${clinic.mail.from:noreply@clinic.local}")
    private String fromAddress;

    @Value("${clinic.mail.enabled:false}")
    private boolean enabled;

    public void sendOptional(String to, String subject, String body) {
        if (!enabled || to == null || to.isBlank()) {
            log.debug("Email skipped (enabled={}, to={})", enabled, to);
            return;
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.debug("JavaMailSender not configured — email skipped");
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
