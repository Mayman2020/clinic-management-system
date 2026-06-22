package com.clinicmanagement.shared.security;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.modules.user.entity.UserRole;
import com.clinicmanagement.shared.exception.AppException;
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
