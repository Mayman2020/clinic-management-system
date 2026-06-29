package com.clinicmanagement.shared.sms;

import com.clinicmanagement.modules.settings.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service @RequiredArgsConstructor @Slf4j
public class SmsService {
    private final SettingsService settingsService;
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isEnabled() {
        return "true".equalsIgnoreCase(settingsService.resolveValue("sms_enabled", "false"));
    }

    public void sendOptional(String phone, String message) {
        if (!isEnabled() || phone == null || phone.isBlank() || message == null || message.isBlank()) {
            log.debug("SMS skipped (enabled={}, phone={})", isEnabled(), phone);
            return;
        }
        String provider = settingsService.resolveValue("sms_provider", "none");
        try {
            switch (provider.toLowerCase()) {
                case "twilio" -> sendTwilio(phone.trim(), message);
                case "http" -> sendHttpGateway(phone.trim(), message);
                default -> log.debug("SMS provider '{}' not configured", provider);
            }
        } catch (Exception e) {
            log.warn("Failed to send SMS to {}: {}", phone, e.getMessage());
        }
    }

    private void sendTwilio(String phone, String message) {
        String sid = settingsService.resolveValue("sms_twilio_account_sid", "");
        String token = settingsService.resolveValue("sms_twilio_auth_token", "");
        String from = settingsService.resolveValue("sms_twilio_from_number", "");
        if (sid.isBlank() || token.isBlank() || from.isBlank()) {
            log.warn("Twilio SMS not configured — missing credentials");
            return;
        }
        String url = "https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String auth = sid + ":" + token;
        headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8)));
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("To", phone);
        body.add("From", from);
        body.add("Body", message);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("Twilio SMS sent to {}", phone);
        } else {
            log.warn("Twilio SMS failed: {}", response.getStatusCode());
        }
    }

    private void sendHttpGateway(String phone, String message) {
        String url = settingsService.resolveValue("sms_http_url", "");
        if (url.isBlank()) {
            log.warn("HTTP SMS gateway URL not configured");
            return;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String apiKey = settingsService.resolveValue("sms_http_api_key", "");
        if (!apiKey.isBlank()) headers.set("X-API-Key", apiKey);
        Map<String, String> payload = Map.of("phone", phone, "message", message);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(payload, headers), String.class);
        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("HTTP gateway SMS sent to {}", phone);
        } else {
            log.warn("HTTP gateway SMS failed: {}", response.getStatusCode());
        }
    }
}
