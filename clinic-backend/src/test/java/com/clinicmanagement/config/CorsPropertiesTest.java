package com.clinicmanagement.config;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CorsPropertiesTest {

    @Test
    void resolvedPatternsFallsBackToLocalDefaultsWhenBlank() {
        CorsProperties properties = new CorsProperties();
        properties.setAllowedOriginPatterns("");

        assertEquals(List.of("http://localhost:[*]", "http://127.0.0.1:[*]"), properties.resolvedPatterns());
    }

    @Test
    void resolvedPatternsUsesConfiguredValues() {
        CorsProperties properties = new CorsProperties();
        properties.setAllowedOriginPatterns("https://example.com, https://app.example.com");

        assertEquals(List.of("https://example.com", "https://app.example.com"), properties.resolvedPatterns());
    }
}
