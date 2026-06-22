package com.clinicmanagement.modules.permission.service;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.modules.user.entity.UserRole;
import com.clinicmanagement.shared.exception.AppException;
import com.clinicmanagement.shared.security.ActiveRoleService;
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
