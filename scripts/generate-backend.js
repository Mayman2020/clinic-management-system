/**
 * Generates the complete Spring Boot backend for clinic-management-system.
 * Run: node scripts/generate-backend.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BE = path.join(ROOT, 'clinic-backend');
const PKG = 'com.clinicmanagement';
const P = PKG;
const SCHEMA = 'clinic_mgmt';
const PROP_BACKEND = path.join('d:', 'Apps Work', 'My Apps', 'Property_Managments', 'property-backend');
const JAVA = path.join(BE, 'src/main/java', PKG.replace(/\./g, '/'));
const RES = path.join(BE, 'src/main/resources');

const ROLES = ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGY_STAFF', 'CASHIER'];
const PERM_MODULES = ['dashboard', 'patients', 'doctors', 'appointments', 'queue', 'calendar',
  'consultation', 'prescription', 'lab', 'radiology', 'billing', 'insurance',
  'reports', 'settings', 'users', 'permissions'];
const PERM_ACTIONS = ['enabled', 'menu', 'view', 'create', 'edit', 'delete', 'export', 'approve'];
const BCRYPT_HASH = '$2b$10$IXh3uclXYEBX0AiGQOzh6OHneA6fAFQOanEULz1TmAHUtCrv8RwGm';

const stats = { java: 0, other: 0, issues: [] };

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function write(rel, content) {
  const full = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, 'utf8');
  if (rel.endsWith('.java') || (typeof rel === 'string' && full.endsWith('.java'))) stats.java++;
  else stats.other++;
}

function j(rel, body) {
  write(path.join(JAVA, rel), body);
}

function copy(src, dest) {
  if (!fs.existsSync(src)) {
    stats.issues.push(`Missing source: ${src}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  stats.other++;
}

function imp(...parts) { return parts.map(p => `import ${P}.${p};`).join('\n'); }

// ─── pom.xml ───────────────────────────────────────────────────────────────
write(path.join(BE, 'pom.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>
    <groupId>${PKG}</groupId>
    <artifactId>clinic-backend</artifactId>
    <version>1.0.0</version>
    <name>clinic-backend</name>
    <description>Clinic Management System — Spring Boot Backend</description>
    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.5</jjwt.version>
    </properties>
    <dependencies>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-aop</artifactId></dependency>
        <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
        <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
        <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>\${jjwt.version}</version></dependency>
        <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-impl</artifactId><version>\${jjwt.version}</version><scope>runtime</scope></dependency>
        <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-jackson</artifactId><version>\${jjwt.version}</version><scope>runtime</scope></dependency>
        <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-devtools</artifactId><scope>runtime</scope><optional>true</optional></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-test</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.testcontainers</groupId><artifactId>postgresql</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.testcontainers</groupId><artifactId>junit-jupiter</artifactId><scope>test</scope></dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-surefire-plugin</artifactId>
                <configuration><excludes><exclude>**/*IntegrationTest.java</exclude></excludes></configuration></plugin>
            <plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <jvmArguments>-Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8</jvmArguments>
                    <excludes><exclude><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></exclude></excludes>
                </configuration></plugin>
        </plugins>
    </build>
    <profiles>
        <profile><id>integration</id><build><plugins>
            <plugin><groupId>org.apache.maven.plugins</groupId><artifactId>maven-surefire-plugin</artifactId>
                <configuration combine.self="override"><excludes combine.children="override"/></configuration></plugin>
        </plugins></build></profile>
    </profiles>
</project>`);

// ─── application.yml & messages ────────────────────────────────────────────
write(path.join(RES, 'application.yml'), `spring:
  datasource:
    url: \${DB_URL:\${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/postgres?currentSchema=${SCHEMA}}}
    username: \${DB_USER:\${SPRING_DATASOURCE_USERNAME:postgres}}
    password: \${DB_PASS:\${SPRING_DATASOURCE_PASSWORD:\${DB_PASSWORD:admin}}}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      connection-timeout: 30000
  flyway:
    enabled: true
    locations: classpath:db/migration
    create-schemas: true
    default-schema: ${SCHEMA}
    schemas: ${SCHEMA},public
    baseline-on-migrate: true
    validate-on-migrate: false
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        default_schema: ${SCHEMA}
  servlet:
    multipart:
      enabled: true
      max-file-size: 50MB
      max-request-size: 100MB
  messages:
    basename: messages
    encoding: UTF-8
    fallback-to-system-locale: false
  web:
    locale: en
    locale-resolver: accept-header
jwt:
  secret: \${JWT_SECRET:ClinicManagementSecretKey2024VeryLongAndSecureKeyForJWT}
  expiration: 86400000
  refresh-expiration: 604800000
user:
  default:
    password: \${USER_DEFAULT_PASSWORD:admin123}
server:
  port: 8082
  servlet:
    context-path: /api/v1
logging:
  level:
    ${PKG}: INFO
    org.springframework.security: WARN
    org.flywaydb: INFO
    org.hibernate.SQL: WARN
`);

write(path.join(RES, 'messages.properties'), `# Clinic Management System — English messages
auth.error.credentials_required=Username and password are required.
auth.error.unknown_user=No account found with this username.
auth.error.account_inactive=This account is inactive.
auth.error.invalid_password=Username or password is incorrect. Please try again.
auth.refresh.invalid=Refresh token is invalid or expired.
auth.refresh.user_not_found=User not found.
auth.refresh.account_inactive=Account is deactivated.
error.unauthorized=Username or password is incorrect. Please try again.
error.access_denied=Access denied.
error.not_found=Resource not found.
error.method_not_allowed=HTTP method is not allowed for this URL.
error.invalid_date_format=Invalid date format. Expected ISO_LOCAL_DATE (yyyy-MM-dd).
error.invalid_parameter=Invalid parameter value.
error.missing_parameter=A required parameter is missing.
error.invalid_request_body=Request body is missing or malformed.
error.internal=Internal server error.
error.email_user_conflict=Email or username already in use.
error.national_id_conflict=National ID is already registered for another patient.
error.patient_duplicate=Patient with this national ID already exists.
`);

// ─── Main Application ──────────────────────────────────────────────────────
j('ClinicManagementApplication.java', `package ${P};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableScheduling
public class ClinicManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClinicManagementApplication.class, args);
    }
}
`);

// ─── Config ────────────────────────────────────────────────────────────────
j('config/SecurityConfig.java', `package ${P}.config;
import ${P}.shared.security.JwtAuthFilter;
import ${P}.shared.security.MustChangePasswordFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration @EnableWebSecurity @EnableMethodSecurity @RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final MustChangePasswordFilter mustChangePasswordFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http.cors(c -> c.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(mustChangePasswordFilter, JwtAuthFilter.class)
            .build();
    }
    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
`);

j('config/CorsConfig.java', `package ${P}.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:3000","http://localhost:4200","http://localhost:4500",
            "http://127.0.0.1:3000","http://127.0.0.1:4200","http://127.0.0.1:4500"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setExposedHeaders(List.of("Authorization","Content-Disposition","X-Active-Role"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
`);

j('config/AuditingConfig.java', `package ${P}.config;
import ${P}.shared.security.SecurityAuditorAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

@Configuration
public class AuditingConfig {
    @Bean(name = "auditorProvider")
    public AuditorAware<Long> auditorProvider(SecurityAuditorAware securityAuditorAware) {
        return securityAuditorAware;
    }
}
`);

j('config/WebMvcConfig.java', `package ${P}.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
}
`);

// ─── Shared ────────────────────────────────────────────────────────────────
j('shared/response/ApiResponse.java', `package ${P}.shared.response;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter @JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private final String errorCode;
    private final LocalDateTime timestamp;

    private ApiResponse(boolean success, String message, T data, String errorCode) {
        this.success = success; this.message = message; this.data = data;
        this.errorCode = errorCode; this.timestamp = LocalDateTime.now();
    }
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, "Success", data, null); }
    public static <T> ApiResponse<T> ok(String message, T data) { return new ApiResponse<>(true, message, data, null); }
    public static <T> ApiResponse<T> error(String message) { return new ApiResponse<>(false, message, null, null); }
    public static <T> ApiResponse<T> error(String message, String errorCode) { return new ApiResponse<>(false, message, null, errorCode); }
}
`);

j('shared/exception/AppException.java', `package ${P}.shared.exception;
import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;
    public AppException(String message, HttpStatus status) { super(message); this.status = status; this.errorCode = null; }
    public AppException(String message, HttpStatus status, String errorCode) { super(message); this.status = status; this.errorCode = errorCode; }
    public static AppException notFound(String message) { return new AppException(message, HttpStatus.NOT_FOUND, "NOT_FOUND"); }
    public static AppException badRequest(String message) { return badRequest(message, "BAD_REQUEST"); }
    public static AppException badRequest(String message, String errorCode) { return new AppException(message, HttpStatus.BAD_REQUEST, errorCode); }
    public static AppException forbidden(String message) { return new AppException(message, HttpStatus.FORBIDDEN, "FORBIDDEN"); }
    public static AppException conflict(String message) { return new AppException(message, HttpStatus.CONFLICT, "CONFLICT"); }
    public static AppException conflict(String message, String errorCode) { return new AppException(message, HttpStatus.CONFLICT, errorCode); }
}
`);

j('shared/exception/GlobalExceptionHandler.java', `package ${P}.shared.exception;
import ${P}.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import java.time.format.DateTimeParseException;
import java.util.stream.Collectors;

@Slf4j @RestControllerAdvice @RequiredArgsConstructor
public class GlobalExceptionHandler {
    private final MessageSource messageSource;
    private String tr(String code, WebRequest request) {
        return messageSource.getMessage(code, null, code, request.getLocale());
    }
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        log.warn("AppException [{}] code={}", ex.getStatus(), ex.getErrorCode());
        return ResponseEntity.status(ex.getStatus()).body(ApiResponse.error(ex.getMessage(), ex.getErrorCode()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ApiResponse.error(message, "VALIDATION_ERROR"));
    }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuth(AuthenticationException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(tr("error.unauthorized", request), "UNAUTHORIZED"));
    }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(tr("error.access_denied", request), "FORBIDDEN"));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex, WebRequest request) {
        String detail = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        if (detail != null) {
            if (detail.contains("patients") && detail.contains("national_id")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(tr("error.national_id_conflict", request), "NATIONAL_ID_ALREADY_USED"));
            }
            if (detail.contains("users") && (detail.contains("email") || detail.contains("username"))) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(tr("error.email_user_conflict", request), "EMAIL_ALREADY_USED"));
            }
        }
        log.error("Data integrity violation", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(tr("error.internal", request), "INTERNAL_ERROR"));
    }
    @ExceptionHandler({ NoHandlerFoundException.class, NoResourceFoundException.class })
    public ResponseEntity<ApiResponse<Void>> handleNotFound(Exception ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(tr("error.not_found", request), "NOT_FOUND"));
    }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(ApiResponse.error(tr("error.method_not_allowed", request), "METHOD_NOT_ALLOWED"));
    }
    @ExceptionHandler(DateTimeParseException.class)
    public ResponseEntity<ApiResponse<Void>> handleDateParse(DateTimeParseException ex, WebRequest request) {
        return ResponseEntity.badRequest().body(ApiResponse.error(tr("error.invalid_date_format", request), "INVALID_DATE_FORMAT"));
    }
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        return ResponseEntity.badRequest().body(ApiResponse.error(tr("error.invalid_parameter", request), "INVALID_PARAMETER"));
    }
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex, WebRequest request) {
        return ResponseEntity.badRequest().body(ApiResponse.error(tr("error.missing_parameter", request), "MISSING_PARAMETER"));
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleJsonParse(HttpMessageNotReadableException ex, WebRequest request) {
        return ResponseEntity.badRequest().body(ApiResponse.error(tr("error.invalid_request_body", request), "INVALID_REQUEST_BODY"));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex, WebRequest request) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(tr("error.internal", request), "INTERNAL_ERROR"));
    }
}
`);

// ─── Shared Security & Persistence ─────────────────────────────────────────
const securityFiles = {
  'shared/security/JwtUtil.java': `package ${P}.shared.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Slf4j @Component
public class JwtUtil {
    @Value("\${jwt.secret}") private String secret;
    @Value("\${jwt.expiration}") private long expiration;
    @Value("\${jwt.refresh-expiration}") private long refreshExpiration;
    private SecretKey getKey() { return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }
    public String generateToken(String subject, Map<String, Object> claims) {
        return Jwts.builder().subject(subject).claims(claims).issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration)).signWith(getKey()).compact();
    }
    public String generateRefreshToken(String subject) {
        return Jwts.builder().subject(subject).issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpiration)).signWith(getKey()).compact();
    }
    public Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload();
    }
    public String extractSubject(String token) { return extractAllClaims(token).getSubject(); }
    public boolean isValid(String token) {
        try { extractAllClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { log.debug("Invalid JWT: {}", e.getMessage()); return false; }
    }
    public Date extractExpiration(String token) { return extractAllClaims(token).getExpiration(); }
}
`,
  'shared/security/JwtAuthFilter.java': `package ${P}.shared.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Slf4j @Component @RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklist;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);
        if (token == null || tokenBlacklist.isRevoked(token) || !jwtUtil.isValid(token)) {
            filterChain.doFilter(request, response); return;
        }
        String username = jwtUtil.extractSubject(token);
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (userDetails.isEnabled()) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) { log.debug("Could not set authentication: {}", e.getMessage()); }
        }
        filterChain.doFilter(request, response);
    }
    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        return authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    }
}
`,
  'shared/security/MustChangePasswordFilter.java': `package ${P}.shared.security;
import com.fasterxml.jackson.databind.ObjectMapper;
import ${P}.shared.response.ApiResponse;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component @RequiredArgsConstructor
public class MustChangePasswordFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper;
    private static final List<String> ALLOWED = List.of("/auth/", "/users/me/change-password");
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ") || !jwtUtil.isValid(authHeader.substring(7))) {
            filterChain.doFilter(request, response); return;
        }
        Claims claims = jwtUtil.extractAllClaims(authHeader.substring(7));
        if (!Boolean.TRUE.equals(claims.get("mustChangePassword", Boolean.class))) {
            filterChain.doFilter(request, response); return;
        }
        String path = request.getServletPath();
        if (ALLOWED.stream().anyMatch(path::startsWith)) { filterChain.doFilter(request, response); return; }
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(
            "You must change your temporary password before continuing.", "PASSWORD_CHANGE_REQUIRED")));
    }
}
`,
  'shared/security/RevokedTokenEntity.java': `package ${P}.shared.security;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "revoked_tokens") @Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class RevokedTokenEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64) private String tokenHash;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "created_at") private Instant createdAt;
}
`,
  'shared/security/RevokedTokenRepository.java': `package ${P}.shared.security;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedTokenEntity, Long> {
    Optional<RevokedTokenEntity> findByTokenHash(String tokenHash);
    boolean existsByTokenHash(String tokenHash);
    @Modifying @Transactional @Query("DELETE FROM RevokedTokenEntity r WHERE r.expiresAt < :now")
    int deleteExpired(Instant now);
}
`,
  'shared/security/TokenBlacklistService.java': `package ${P}.shared.security;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

@Slf4j @Service @RequiredArgsConstructor
public class TokenBlacklistService {
    private final RevokedTokenRepository repository;
    @Transactional
    public void revoke(String token, Instant expiry) {
        if (token == null || token.isBlank() || expiry == null) return;
        String hash = sha256(token);
        if (!repository.existsByTokenHash(hash)) {
            repository.save(RevokedTokenEntity.builder().tokenHash(hash).expiresAt(expiry).createdAt(Instant.now()).build());
        }
    }
    @Transactional(readOnly = true)
    public boolean isRevoked(String token) {
        if (token == null || token.isBlank()) return false;
        return repository.findByTokenHash(sha256(token)).map(r -> Instant.now().isBefore(r.getExpiresAt())).orElse(false);
    }
    @Scheduled(fixedDelay = 3_600_000) @Transactional
    public void purgeExpiredTokens() {
        int deleted = repository.deleteExpired(Instant.now());
        if (deleted > 0) log.debug("Purged {} expired revoked token records", deleted);
    }
    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException("SHA-256 unavailable", e); }
    }
}
`,
  'shared/security/LoginAttemptService.java': `package ${P}.shared.security;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;
    private record AttemptRecord(int count, LocalDateTime lockedUntil) {}
    private final ConcurrentHashMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();
    public void recordSuccess(String key) { attempts.remove(key.toLowerCase()); }
    public void recordFailure(String key) {
        String k = key.toLowerCase();
        AttemptRecord current = attempts.getOrDefault(k, new AttemptRecord(0, null));
        int newCount = current.count() + 1;
        attempts.put(k, new AttemptRecord(newCount, newCount >= MAX_ATTEMPTS ? LocalDateTime.now().plusMinutes(LOCK_MINUTES) : null));
    }
    public boolean isLocked(String key) {
        AttemptRecord record = attempts.get(key.toLowerCase());
        if (record == null || record.lockedUntil() == null) return false;
        if (LocalDateTime.now().isAfter(record.lockedUntil())) { attempts.remove(key.toLowerCase()); return false; }
        return true;
    }
}
`,
  'shared/security/SecurityAuditorAware.java': `package ${P}.shared.security;
import ${P}.modules.user.entity.User;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class SecurityAuditorAware implements AuditorAware<Long> {
    @Override
    public Optional<Long> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return Optional.empty();
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user && user.getId() != null) return Optional.of(user.getId());
        return Optional.empty();
    }
}
`,
  'shared/security/ActiveRoleService.java': `package ${P}.shared.security;
import ${P}.modules.user.entity.User;
import ${P}.modules.user.entity.UserRole;
import ${P}.shared.exception.AppException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class ActiveRoleService {
    public static final String HEADER = "X-Active-Role";

    public UserRole resolveEffectiveRole(User user) {
        String header = currentHeader();
        if (header == null || header.isBlank()) return user.getRole();
        try {
            UserRole requested = UserRole.valueOf(header.trim().toUpperCase());
            if (!user.getAllAssignedRoles().contains(requested)) {
                throw AppException.forbidden("Selected role is not assigned to this user");
            }
            return requested;
        } catch (IllegalArgumentException e) {
            throw AppException.badRequest("Invalid active role header");
        }
    }

    private String currentHeader() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) return null;
        HttpServletRequest request = attrs.getRequest();
        return request != null ? request.getHeader(HEADER) : null;
    }
}
`,
  'shared/persistence/StringListJsonConverter.java': `package ${P}.shared.persistence;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Converter
public class StringListJsonConverter implements AttributeConverter<List<String>, String> {
    private static final ObjectMapper M = new ObjectMapper();
    private static final TypeReference<List<String>> TYPE = new TypeReference<>() {};
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) return null;
        try { return M.writeValueAsString(attribute); }
        catch (JsonProcessingException e) { throw new IllegalArgumentException("Failed to serialize string list", e); }
    }
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return new ArrayList<>();
        try {
            List<String> parsed = M.readValue(dbData, TYPE);
            return parsed == null ? new ArrayList<>() : parsed;
        } catch (Exception e) { return new ArrayList<>(Collections.singletonList(dbData)); }
    }
}
`
};
Object.entries(securityFiles).forEach(([rel, body]) => j(rel, body));

// ─── Auth, User, Permission, Domain modules ────────────────────────────────
require('./generate-backend-domains')({
  j, P, PKG, write, RES, ROLES, PERM_MODULES, PERM_ACTIONS, BE, ROOT, stats
});

// ─── Copy Maven wrapper ──────────────────────────────────────────────────────
copy(path.join(PROP_BACKEND, 'mvnw'), path.join(BE, 'mvnw'));
copy(path.join(PROP_BACKEND, 'mvnw.cmd'), path.join(BE, 'mvnw.cmd'));
copy(path.join(PROP_BACKEND, '.mvn', 'wrapper', 'maven-wrapper.properties'),
  path.join(BE, '.mvn', 'wrapper', 'maven-wrapper.properties'));

// ─── Update V3 seed bcrypt hash ──────────────────────────────────────────────
const v3Path = path.join(RES, 'db/migration/V3__seed_users.sql');
write(v3Path, `-- V3: Seed admin user (username=admin, password=admin123)
SET search_path TO clinic_mgmt;
INSERT INTO users (username, email, password_hash, full_name, role, is_active, must_change_password)
VALUES ('admin', 'admin@clinic.local',
'${BCRYPT_HASH}',
'System Administrator', 'ADMIN', TRUE, FALSE)
ON CONFLICT (username) DO NOTHING;
`);

const genProjectPath = path.join(ROOT, 'scripts/generate-project.js');
if (fs.existsSync(genProjectPath)) {
  let src = fs.readFileSync(genProjectPath, 'utf8');
  const oldHash = /\$2[ab]\$10\$[A-Za-z0-9./]+/;
  if (oldHash.test(src)) {
    src = src.replace(oldHash, BCRYPT_HASH);
    fs.writeFileSync(genProjectPath, src, 'utf8');
  } else {
    stats.issues.push('Could not update bcrypt hash in generate-project.js');
  }
} else {
  stats.issues.push('generate-project.js not found — run it first to create SQL migrations V1-V4');
}

['V1__init_schema.sql', 'V2__seed_roles.sql', 'V4__seed_demo_data.sql'].forEach(f => {
  if (!fs.existsSync(path.join(RES, 'db/migration', f))) {
    stats.issues.push(`Missing migration ${f} — run: node scripts/generate-project.js`);
  }
});

console.log('Clinic backend generated at:', BE);
console.log('Java files:', stats.java);
console.log('Other files:', stats.other);
if (stats.issues.length) {
  console.log('Issues:');
  stats.issues.forEach(i => console.log(' -', i));
}

