package com.clinicmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
class ClinicIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("clinic_test");

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> postgres.getJdbcUrl() + "?currentSchema=clinic_mgmt");
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("clinic.mail.enabled", () -> "false");
        registry.add("jwt.secret", () -> "TestSecretKeyForClinicIntegrationTestsOnlyMustBeLongEnough");
    }

    @Autowired
    private TestRestTemplate rest;

    @Test
    void loginAndBranchContext() {
        ResponseEntity<Map> login = rest.postForEntity("/auth/login",
            Map.of("username", "admin", "password", "Dev@Local2026!"), Map.class);
        assertThat(login.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(login.getBody()).isNotNull();
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) login.getBody().get("data");
        assertThat(data).containsKey("accessToken");

        String token = (String) data.get("accessToken");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<Map> context = rest.exchange("/branches/context", HttpMethod.GET,
            new HttpEntity<>(headers), Map.class);
        assertThat(context.getStatusCode()).isEqualTo(HttpStatus.OK);
        @SuppressWarnings("unchecked")
        Map<String, Object> ctx = (Map<String, Object>) context.getBody().get("data");
        assertThat(ctx.get("multiBranchEnabled")).isEqualTo(false);
        assertThat(ctx.get("currentBranchId")).isEqualTo(1);
    }
}
