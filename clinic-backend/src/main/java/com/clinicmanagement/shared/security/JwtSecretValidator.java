package com.clinicmanagement.shared.security;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtSecretValidator implements InitializingBean {

    private static final int MIN_LENGTH = 32;

    @Value("${jwt.secret}")
    private String secret;

    @Override
    public void afterPropertiesSet() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is required. Set the JWT_SECRET environment variable (minimum 32 characters).");
        }
        if (secret.length() < MIN_LENGTH) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least " + MIN_LENGTH + " characters.");
        }
    }
}
