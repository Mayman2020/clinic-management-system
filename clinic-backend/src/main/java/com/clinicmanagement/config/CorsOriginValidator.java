package com.clinicmanagement.config;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class CorsOriginValidator implements org.springframework.beans.factory.InitializingBean {

    private final CorsProperties corsProperties;
    private final Environment environment;

    @Override
    public void afterPropertiesSet() {
        if (!isProdProfile()) {
            return;
        }
        if (corsProperties.resolvedPatterns().isEmpty()) {
            throw new IllegalStateException(
                    "CORS_ALLOWED_ORIGINS is required when spring.profiles.active includes 'prod'. "
                            + "Set comma-separated origin patterns, e.g. https://clinic.example.com");
        }
    }

    private boolean isProdProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }
}
