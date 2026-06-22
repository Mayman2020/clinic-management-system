package com.clinicmanagement.modules.auth.service;
import com.clinicmanagement.modules.auth.dto.LoginRequest;
import com.clinicmanagement.modules.auth.dto.LoginResponse;
import com.clinicmanagement.modules.auth.dto.RefreshTokenRequest;
import com.clinicmanagement.modules.permission.service.RolePermissionService;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.modules.user.entity.UserRole;
import com.clinicmanagement.modules.user.repository.UserRepository;
import com.clinicmanagement.shared.exception.AppException;
import com.clinicmanagement.shared.security.JwtUtil;
import com.clinicmanagement.shared.security.LoginAttemptService;
import com.clinicmanagement.shared.security.TokenBlacklistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
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

    @Value("${jwt.expiration}") private long jwtExpiration;

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
        } catch (AuthenticationException e) {
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
