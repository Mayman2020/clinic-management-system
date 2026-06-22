package com.clinicmanagement.modules.user.service;
import com.clinicmanagement.modules.user.dto.*;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.modules.user.entity.UserRole;
import com.clinicmanagement.modules.user.repository.UserRepository;
import com.clinicmanagement.shared.exception.AppException;
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
    @Value("${user.default.password:admin123}") private String defaultPassword;
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

    @Transactional
    public UserResponse toggleActive(Long id) {
        User user = find(id);
        user.setActive(!user.isActive());
        return toResponse(userRepository.save(user));
    }

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
