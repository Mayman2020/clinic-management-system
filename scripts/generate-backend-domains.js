/**
 * Domain module generators for generate-backend.js
 */
module.exports = function registerDomains(ctx) {
  const { j, P, ROLES, PERM_MODULES, PERM_ACTIONS } = ctx;

  // ─── Auth ──────────────────────────────────────────────────────────────────
  j('modules/auth/dto/LoginRequest.java', `package ${P}.modules.auth.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank private String username;
    @NotBlank private String password;
}
`);

  j('modules/auth/dto/RefreshTokenRequest.java', `package ${P}.modules.auth.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank private String refreshToken;
}
`);

  j('modules/auth/dto/LoginResponse.java', `package ${P}.modules.auth.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserDto user;

    @Data @Builder
    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String phone;
        private String role;
        private List<String> extraRoles;
        private Map<String, Map<String, Boolean>> permissions;
        private boolean mustChangePassword;
    }
}
`);

  j('modules/auth/service/UserDetailsServiceImpl.java', `package ${P}.modules.auth.service;
import ${P}.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsernameIgnoreCase(username.trim())
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
`);

  j('modules/auth/service/AuthService.java', `package ${P}.modules.auth.service;
import ${P}.modules.auth.dto.LoginRequest;
import ${P}.modules.auth.dto.LoginResponse;
import ${P}.modules.auth.dto.RefreshTokenRequest;
import ${P}.modules.permission.service.RolePermissionService;
import ${P}.modules.user.entity.User;
import ${P}.modules.user.entity.UserRole;
import ${P}.modules.user.repository.UserRepository;
import ${P}.shared.exception.AppException;
import ${P}.shared.security.JwtUtil;
import ${P}.shared.security.LoginAttemptService;
import ${P}.shared.security.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RolePermissionService rolePermissionService;
    private final LoginAttemptService loginAttemptService;
    private final TokenBlacklistService tokenBlacklist;

    @Value("\${jwt.expiration}") private long jwtExpiration;

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        if (request.getUsername() == null || request.getPassword() == null) {
            throw AppException.badRequest("Username and password are required.");
        }
        String rawUsername = request.getUsername().trim();
        if (loginAttemptService.isLocked(rawUsername)) {
            throw AppException.badRequest("Account temporarily locked due to too many failed attempts. Try again later.");
        }
        User resolved = userRepository.findByUsernameIgnoreCase(rawUsername)
            .orElseThrow(() -> { loginAttemptService.recordFailure(rawUsername);
                return AppException.badRequest("Username or password is incorrect. Please try again."); });
        if (!resolved.isActive()) throw AppException.badRequest("This account is inactive.");
        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(resolved.getUsername(), request.getPassword()));
            User user = (User) auth.getPrincipal();
            loginAttemptService.recordSuccess(rawUsername);
            user.setLastLogin(LocalDateTime.now());
            user.setLastLoginIp(resolveClientIp(httpRequest));
            userRepository.save(user);
            return buildResponse(user);
        } catch (DisabledException e) {
            throw AppException.badRequest("This account is inactive.");
        } catch (BadCredentialsException | AuthenticationException e) {
            loginAttemptService.recordFailure(rawUsername);
            throw AppException.badRequest("Username or password is incorrect. Please try again.");
        }
    }

    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            if (jwtUtil.isValid(token)) {
                tokenBlacklist.revoke(token, jwtUtil.extractExpiration(token).toInstant());
            }
        }
    }

    public LoginResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtUtil.isValid(token)) throw AppException.badRequest("Refresh token is invalid or expired.");
        String username = jwtUtil.extractSubject(token);
        User user = userRepository.findByUsernameIgnoreCase(username)
            .orElseThrow(() -> AppException.notFound("User not found."));
        if (!user.isActive()) throw AppException.badRequest("Account is deactivated.");
        return buildResponse(user);
    }

    private LoginResponse buildResponse(User user) {
        Map<String, Object> claims = Map.of(
            "role", user.getRole().name(), "userId", user.getId(),
            "mustChangePassword", user.isMustChangePassword());
        String accessToken = jwtUtil.generateToken(user.getUsername(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());
        List<Map<String, Map<String, Boolean>>> permMaps = new ArrayList<>();
        for (UserRole r : user.getAllAssignedRoles()) permMaps.add(rolePermissionService.getPermissionMap(r));
        LoginResponse.UserDto userDto = LoginResponse.UserDto.builder()
            .id(user.getId()).username(user.getUsername()).email(user.getEmail())
            .fullName(user.getFullName()).phone(user.getPhone()).role(user.getRole().name())
            .extraRoles(user.getExtraRolesList().stream().map(Enum::name).toList())
            .permissions(RolePermissionService.mergePermissionMaps(permMaps))
            .mustChangePassword(user.isMustChangePassword()).build();
        return LoginResponse.builder().accessToken(accessToken).refreshToken(refreshToken)
            .tokenType("Bearer").expiresIn(jwtExpiration / 1000).user(userDto).build();
    }

    private static String resolveClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
`);

  j('modules/auth/controller/AuthController.java', `package ${P}.modules.auth.controller;
import ${P}.modules.auth.dto.LoginRequest;
import ${P}.modules.auth.dto.LoginResponse;
import ${P}.modules.auth.dto.RefreshTokenRequest;
import ${P}.modules.auth.service.AuthService;
import ${P}.shared.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request, httpRequest)));
    }
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(request)));
    }
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        authService.logout(request.getHeader("Authorization"));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
`);

  // ─── User ──────────────────────────────────────────────────────────────────
  j('modules/user/entity/UserRole.java', `package ${P}.modules.user.entity;
public enum UserRole { ${ROLES.join(', ')} }
`);

  j('modules/user/entity/User.java', `package ${P}.modules.user.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name = "users") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false, length = 100) private String username;
    @Column(unique = true, nullable = false, length = 150) private String email;
    @Column(name = "password_hash", nullable = false) private String password;
    @Column(name = "full_name", length = 150) private String fullName;
    @Column(length = 20) private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private UserRole role;
    @Column(name = "extra_roles", length = 500) private String extraRoles;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @Builder.Default @Column(name = "must_change_password") private boolean mustChangePassword = false;
    @Column(name = "last_login") private LocalDateTime lastLogin;
    @Column(name = "last_login_ip", length = 45) private String lastLoginIp;
    @CreatedBy @Column(name = "created_by", updatable = false) private Long createdBy;
    @CreatedDate @Column(name = "created_on", updatable = false) private LocalDateTime createdOn;
    @LastModifiedBy @Column(name = "modified_by") private Long modifiedBy;
    @LastModifiedDate @Column(name = "modified_on") private LocalDateTime modifiedOn;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;

    public List<UserRole> getExtraRolesList() {
        if (extraRoles == null || extraRoles.isBlank()) return List.of();
        List<UserRole> list = new ArrayList<>();
        for (String part : extraRoles.split(",")) {
            if (!part.isBlank()) list.add(UserRole.valueOf(part.trim()));
        }
        return list;
    }
    public List<UserRole> getAllAssignedRoles() {
        LinkedHashSet<UserRole> set = new LinkedHashSet<>();
        if (role != null) set.add(role);
        set.addAll(getExtraRolesList());
        return new ArrayList<>(set);
    }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        LinkedHashSet<SimpleGrantedAuthority> authorities = new LinkedHashSet<>();
        if (role != null) authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        for (UserRole r : getExtraRolesList()) {
            if (r != null && r != role) authorities.add(new SimpleGrantedAuthority("ROLE_" + r.name()));
        }
        return new ArrayList<>(authorities);
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }
}
`);

  j('modules/user/repository/UserRepository.java', `package ${P}.modules.user.repository;
import ${P}.modules.user.entity.User;
import ${P}.modules.user.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    @Query("SELECT u FROM User u WHERE (:q IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%',:q,'%'))) AND (:role IS NULL OR u.role = :role)")
    Page<User> search(@Param("q") String q, @Param("role") UserRole role, Pageable pageable);
}
`);

  j('modules/user/dto/UserRequest.java', `package ${P}.modules.user.dto;
import ${P}.modules.user.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    private String password;
    private String fullName;
    private String phone;
    @NotNull private UserRole role;
    private String extraRoles;
    private Boolean active;
    private Boolean mustChangePassword;
}
`);

  j('modules/user/dto/UserResponse.java', `package ${P}.modules.user.dto;
import ${P}.modules.user.entity.UserRole;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private List<String> extraRoles;
    private boolean active;
    private boolean mustChangePassword;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
`);

  j('modules/user/dto/ChangePasswordRequest.java', `package ${P}.modules.user.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank private String currentPassword;
    @NotBlank private String newPassword;
}
`);

  j('modules/user/dto/UserProfileUpdateRequest.java', `package ${P}.modules.user.dto;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String email;
}
`);

  j('modules/user/service/UserService.java', `package ${P}.modules.user.service;
import ${P}.modules.user.dto.*;
import ${P}.modules.user.entity.User;
import ${P}.modules.user.entity.UserRole;
import ${P}.modules.user.repository.UserRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class UserService {
    @Value("\${user.default.password:admin123}") private String defaultPassword;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UserResponse> getAll(Pageable pageable, String q, UserRole role) {
        return userRepository.search(trim(q), role, pageable).map(this::toResponse);
    }
    public UserResponse getById(Long id) { return toResponse(find(id)); }
    public UserResponse getMyProfile() { return toResponse(find(currentUserId())); }

    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) throw AppException.conflict("Email already in use", "EMAIL_ALREADY_USED");
        if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) throw AppException.conflict("Username already in use", "USERNAME_ALREADY_USED");
        String raw = request.getPassword() == null || request.getPassword().isBlank() ? defaultPassword : request.getPassword();
        User user = User.builder().username(request.getUsername()).email(request.getEmail())
            .password(passwordEncoder.encode(raw)).fullName(request.getFullName()).phone(request.getPhone())
            .role(request.getRole()).extraRoles(request.getExtraRoles())
            .active(request.getActive() == null || request.getActive())
            .mustChangePassword(request.getMustChangePassword() != null && request.getMustChangePassword()).build();
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = find(id);
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmailIgnoreCase(request.getEmail()))
            throw AppException.conflict("Email already in use", "EMAIL_ALREADY_USED");
        if (!user.getUsername().equalsIgnoreCase(request.getUsername()) && userRepository.existsByUsernameIgnoreCase(request.getUsername()))
            throw AppException.conflict("Username already in use", "USERNAME_ALREADY_USED");
        user.setUsername(request.getUsername()); user.setEmail(request.getEmail());
        user.setFullName(request.getFullName()); user.setPhone(request.getPhone());
        user.setRole(request.getRole()); user.setExtraRoles(request.getExtraRoles());
        if (request.getActive() != null) user.setActive(request.getActive());
        if (request.getPassword() != null && !request.getPassword().isBlank())
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateProfile(UserProfileUpdateRequest request) {
        User user = find(currentUserId());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) throw AppException.conflict("Email already in use", "EMAIL_ALREADY_USED");
            user.setEmail(request.getEmail());
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = find(currentUserId());
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw AppException.badRequest("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    @Transactional
    public void deactivate(Long id) { User u = find(id); u.setActive(false); userRepository.save(u); }

    private User find(Long id) { return userRepository.findById(id).orElseThrow(() -> AppException.notFound("User not found")); }
    private Long currentUserId() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (p instanceof User u) return u.getId();
        throw AppException.forbidden("Authentication required");
    }
    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }

    public UserResponse toResponse(User user) {
        return UserResponse.builder().id(user.getId()).username(user.getUsername()).email(user.getEmail())
            .fullName(user.getFullName()).phone(user.getPhone()).role(user.getRole())
            .extraRoles(user.getExtraRolesList().stream().map(Enum::name).toList())
            .active(user.isActive()).mustChangePassword(user.isMustChangePassword())
            .lastLogin(user.getLastLogin()).createdAt(user.getCreatedAt()).build();
    }
}
`);

  j('modules/user/controller/UserController.java', `package ${P}.modules.user.controller;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.modules.user.dto.*;
import ${P}.modules.user.entity.UserRole;
import ${P}.modules.user.service.UserService;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/users") @RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    @GetMapping @RequiresPermission(module = "users", action = "view")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAll(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) UserRole role) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAll(pageable, q, role)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "users", action = "view")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(id)));
    }
    @GetMapping("/me") @RequiresPermission(module = "users", action = "view")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getMyProfile()));
    }
    @PostMapping @RequiresPermission(module = "users", action = "create")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.create(request)));
    }
    @PutMapping("/{id}") @RequiresPermission(module = "users", action = "edit")
    public ResponseEntity<ApiResponse<UserResponse>> update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.update(id, request)));
    }
    @PutMapping("/me") @RequiresPermission(module = "users", action = "edit")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(@Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.updateProfile(request)));
    }
    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
    @DeleteMapping("/{id}") @RequiresPermission(module = "users", action = "delete")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        userService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
`);

  // ─── Permission / RBAC ─────────────────────────────────────────────────────
  j('modules/permission/annotation/RequiresPermission.java', `package ${P}.modules.permission.annotation;
import java.lang.annotation.*;

@Target(ElementType.METHOD) @Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    String module();
    String action() default "view";
}
`);

  j('modules/permission/aspect/PermissionAspect.java', `package ${P}.modules.permission.aspect;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.modules.permission.service.PermissionEvaluatorService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect @Component @RequiredArgsConstructor
public class PermissionAspect {
    private final PermissionEvaluatorService permissionEvaluator;
    @Around("@annotation(requiredPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequiresPermission requiredPermission) throws Throwable {
        permissionEvaluator.assertCan(requiredPermission.module(), requiredPermission.action());
        return joinPoint.proceed();
    }
}
`);

  j('modules/permission/entity/RolePermissionEntity.java', `package ${P}.modules.permission.entity;
import ${P}.modules.user.entity.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity @Table(name = "role_permissions") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionEntity {
    @Id @Enumerated(EnumType.STRING) @Column(length = 30) private UserRole role;
    @Column(name = "permissions_json", nullable = false, columnDefinition = "TEXT") private String permissionsJson;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/permission/repository/RolePermissionRepository.java', `package ${P}.modules.permission.repository;
import ${P}.modules.permission.entity.RolePermissionEntity;
import ${P}.modules.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermissionEntity, UserRole> {}
`);

  j('modules/permission/dto/RolePermissionResponseDTO.java', `package ${P}.modules.permission.dto;
import ${P}.modules.user.entity.UserRole;
import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data @Builder
public class RolePermissionResponseDTO {
    private UserRole role;
    private Map<String, Map<String, Boolean>> permissions;
}
`);

  j('modules/permission/dto/RolePermissionUpdateRequestDTO.java', `package ${P}.modules.permission.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Map;

@Data
public class RolePermissionUpdateRequestDTO {
    @NotNull private Map<String, Map<String, Boolean>> permissions;
}
`);

  // RolePermissionService with clinic roles
  const rolePermDefaults = ROLES.map(r => `case ${r} -> permissions.replaceAll((k,v) -> fillTrue(v));`).join('\n            ');
  j('modules/permission/service/RolePermissionService.java', `package ${P}.modules.permission.service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ${P}.modules.permission.dto.RolePermissionResponseDTO;
import ${P}.modules.permission.dto.RolePermissionUpdateRequestDTO;
import ${P}.modules.permission.entity.RolePermissionEntity;
import ${P}.modules.permission.repository.RolePermissionRepository;
import ${P}.modules.user.entity.User;
import ${P}.modules.user.entity.UserRole;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service @RequiredArgsConstructor
public class RolePermissionService {
    private static final TypeReference<Map<String, Map<String, Boolean>>> MAP_TYPE = new TypeReference<>() {};
    private final RolePermissionRepository repository;
    private final ObjectMapper objectMapper;

    public List<RolePermissionResponseDTO> getAll() {
        List<RolePermissionResponseDTO> result = new ArrayList<>();
        for (UserRole role : UserRole.values()) result.add(toResponse(findOrCreate(role)));
        return result;
    }
    public RolePermissionResponseDTO getByRole(UserRole role) { return toResponse(findOrCreate(role)); }

    public RolePermissionResponseDTO getMyPermissions(UserRole selectedRole) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) throw AppException.forbidden("Authenticated user is required");
        if (selectedRole != null) {
            if (!user.getAllAssignedRoles().contains(selectedRole)) throw AppException.forbidden("Selected role is not assigned to this user");
            return RolePermissionResponseDTO.builder().role(selectedRole).permissions(getPermissionMap(selectedRole)).build();
        }
        List<Map<String, Map<String, Boolean>>> maps = new ArrayList<>();
        for (UserRole r : user.getAllAssignedRoles()) maps.add(getPermissionMap(r));
        return RolePermissionResponseDTO.builder().role(user.getRole()).permissions(mergePermissionMaps(maps)).build();
    }

    public static Map<String, Map<String, Boolean>> mergePermissionMaps(List<Map<String, Map<String, Boolean>>> maps) {
        if (maps == null || maps.isEmpty()) return new LinkedHashMap<>();
        Map<String, Map<String, Boolean>> out = new LinkedHashMap<>();
        for (Map.Entry<String, Map<String, Boolean>> entry : maps.get(0).entrySet()) out.put(entry.getKey(), new LinkedHashMap<>(entry.getValue()));
        for (int i = 1; i < maps.size(); i++) {
            Map<String, Map<String, Boolean>> next = maps.get(i);
            if (next == null) continue;
            for (Map.Entry<String, Map<String, Boolean>> e : out.entrySet()) {
                Map<String, Boolean> dest = e.getValue();
                Map<String, Boolean> src = next.get(e.getKey());
                if (src == null) continue;
                for (String action : dest.keySet()) dest.put(action, Boolean.TRUE.equals(dest.get(action)) || Boolean.TRUE.equals(src.get(action)));
            }
        }
        return out;
    }

    @Transactional
    public RolePermissionResponseDTO update(UserRole role, RolePermissionUpdateRequestDTO request) {
        RolePermissionEntity entity = findOrCreate(role);
        entity.setPermissionsJson(writePermissions(request.getPermissions()));
        return toResponse(repository.save(entity));
    }

    public Map<String, Map<String, Boolean>> getPermissionMap(UserRole role) {
        return readPermissions(findOrCreate(role).getPermissionsJson());
    }

    private RolePermissionEntity findOrCreate(UserRole role) {
        return repository.findById(role).orElseGet(() -> repository.save(
            RolePermissionEntity.builder().role(role).permissionsJson(writePermissions(defaultPermissions(role))).build()));
    }

    private RolePermissionResponseDTO toResponse(RolePermissionEntity entity) {
        return RolePermissionResponseDTO.builder().role(entity.getRole()).permissions(readPermissions(entity.getPermissionsJson())).build();
    }

    private Map<String, Map<String, Boolean>> readPermissions(String raw) {
        try { return normalize(objectMapper.readValue(raw, MAP_TYPE)); }
        catch (Exception e) { throw AppException.badRequest("Invalid permissions configuration"); }
    }
    private String writePermissions(Map<String, Map<String, Boolean>> permissions) {
        try { return objectMapper.writeValueAsString(normalize(permissions)); }
        catch (Exception e) { throw AppException.badRequest("Unable to save permissions"); }
    }
    private Map<String, Map<String, Boolean>> normalize(Map<String, Map<String, Boolean>> permissions) {
        Map<String, Map<String, Boolean>> normalized = new LinkedHashMap<>();
        Map<String, Map<String, Boolean>> source = permissions != null ? permissions : new LinkedHashMap<>();
        Map<String, Map<String, Boolean>> defaults = defaultPermissions(UserRole.ADMIN);
        for (Map.Entry<String, Map<String, Boolean>> entry : defaults.entrySet()) {
            Map<String, Boolean> current = new LinkedHashMap<>();
            Map<String, Boolean> incoming = source.getOrDefault(entry.getKey(), Map.of());
            for (String action : entry.getValue().keySet()) current.put(action, Boolean.TRUE.equals(incoming.get(action)));
            normalized.put(entry.getKey(), current);
        }
        return normalized;
    }

    public static Map<String, Map<String, Boolean>> defaultPermissions(UserRole role) {
        Map<String, Map<String, Boolean>> permissions = baseCatalog();
        switch (role) {
            ${rolePermDefaults}
            default -> { }
        }
        return permissions;
    }

    private static Map<String, Map<String, Boolean>> baseCatalog() {
        String[] modules = { ${PERM_MODULES.map(m => `"${m}"`).join(', ')} };
        String[] actions = { ${PERM_ACTIONS.map(a => `"${a}"`).join(', ')} };
        Map<String, Map<String, Boolean>> catalog = new LinkedHashMap<>();
        for (String module : modules) {
            Map<String, Boolean> flags = new LinkedHashMap<>();
            for (String action : actions) flags.put(action, false);
            catalog.put(module, flags);
        }
        return catalog;
    }

    private static Map<String, Boolean> fillTrue(Map<String, Boolean> value) {
        Map<String, Boolean> all = new LinkedHashMap<>();
        for (String action : value.keySet()) all.put(action, true);
        return all;
    }
}
`);

  j('modules/permission/service/PermissionEvaluatorService.java', `package ${P}.modules.permission.service;
import ${P}.modules.user.entity.User;
import ${P}.modules.user.entity.UserRole;
import ${P}.shared.exception.AppException;
import ${P}.shared.security.ActiveRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class PermissionEvaluatorService {
    private final RolePermissionService rolePermissionService;
    private final ActiveRoleService activeRoleService;

    public void assertCan(String module, String action) {
        User user = resolveCurrentUser();
        if (user.getRole() == UserRole.ADMIN) return;
        UserRole effectiveRole = activeRoleService.resolveEffectiveRole(user);
        Map<String, Map<String, Boolean>> permissions;
        if (user.getAllAssignedRoles().size() > 1 && effectiveRole == user.getRole()) {
            List<Map<String, Map<String, Boolean>>> maps = user.getAllAssignedRoles().stream()
                .map(rolePermissionService::getPermissionMap).toList();
            permissions = RolePermissionService.mergePermissionMaps(maps);
        } else {
            permissions = rolePermissionService.getPermissionMap(effectiveRole);
        }
        Map<String, Boolean> modulePerms = permissions.get(module);
        if (modulePerms == null || Boolean.FALSE.equals(modulePerms.get("enabled")))
            throw AppException.forbidden("Access denied: module '" + module + "' is not enabled for your role");
        if (!Boolean.TRUE.equals(modulePerms.get(action)))
            throw AppException.forbidden("Access denied: action '" + action + "' on module '" + module + "' is not allowed for your role");
    }

    public boolean can(String module, String action) {
        try { assertCan(module, action); return true; } catch (AppException e) { return false; }
    }

    private User resolveCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) throw AppException.forbidden("Authentication required");
        return user;
    }
}
`);

  j('modules/permission/controller/RolePermissionController.java', `package ${P}.modules.permission.controller;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.modules.permission.dto.RolePermissionResponseDTO;
import ${P}.modules.permission.dto.RolePermissionUpdateRequestDTO;
import ${P}.modules.permission.service.RolePermissionService;
import ${P}.modules.user.entity.UserRole;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/role-permissions") @RequiredArgsConstructor
public class RolePermissionController {
    private final RolePermissionService service;
    @GetMapping @RequiresPermission(module = "permissions", action = "view")
    public ResponseEntity<ApiResponse<List<RolePermissionResponseDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAll()));
    }
    @GetMapping("/me") @RequiresPermission(module = "permissions", action = "view")
    public ResponseEntity<ApiResponse<RolePermissionResponseDTO>> getMine(@RequestParam(required = false) UserRole role) {
        return ResponseEntity.ok(ApiResponse.ok(service.getMyPermissions(role)));
    }
    @PutMapping("/{role}") @RequiresPermission(module = "permissions", action = "edit")
    public ResponseEntity<ApiResponse<RolePermissionResponseDTO>> update(@PathVariable UserRole role,
            @Valid @RequestBody RolePermissionUpdateRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(role, request)));
    }
}
`);

  // Continue in part 2 - domain modules
  require('./generate-backend-domains-part2')(ctx);
};
