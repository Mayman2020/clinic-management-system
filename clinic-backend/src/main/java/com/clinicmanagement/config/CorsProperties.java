package com.clinicmanagement.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /** Comma-separated Spring CORS origin patterns (env: CORS_ALLOWED_ORIGINS). */
    private String allowedOriginPatterns = "";

    public List<String> resolvedPatterns() {
        if (allowedOriginPatterns == null || allowedOriginPatterns.isBlank()) {
            return List.of();
        }
        return Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
