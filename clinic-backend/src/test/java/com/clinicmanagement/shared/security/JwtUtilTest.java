package com.clinicmanagement.shared.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {
    private final JwtUtil jwtUtil = new JwtUtil();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtil, "secret", "test-secret-key-must-be-long-enough-for-hmac-sha256");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 60_000L);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiration", 120_000L);
    }

    @Test
    void accessAndRefreshTokensAreTyped() {
        String access = jwtUtil.generateToken("admin", Map.of("role", "ADMIN"));
        String refresh = jwtUtil.generateRefreshToken("admin");
        assertTrue(jwtUtil.isAccessToken(access));
        assertFalse(jwtUtil.isRefreshToken(access));
        assertTrue(jwtUtil.isRefreshToken(refresh));
        assertFalse(jwtUtil.isAccessToken(refresh));
    }

    @Test
    void refreshTokenCannotPassAsAccessToken() {
        String refresh = jwtUtil.generateRefreshToken("user1");
        assertTrue(jwtUtil.isValid(refresh));
        assertFalse(jwtUtil.isAccessToken(refresh));
    }
}
