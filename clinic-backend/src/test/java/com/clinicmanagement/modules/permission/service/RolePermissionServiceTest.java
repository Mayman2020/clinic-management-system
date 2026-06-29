package com.clinicmanagement.modules.permission.service;

import com.clinicmanagement.modules.user.entity.UserRole;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class RolePermissionServiceTest {

    @Test
    void doctorDoesNotGetUsersOrSettingsAccess() {
        Map<String, Map<String, Boolean>> perms = RolePermissionService.defaultPermissions(UserRole.DOCTOR);
        assertFalse(perms.get("users").get("view"));
        assertFalse(perms.get("settings").get("view"));
        assertTrue(perms.get("consultation").get("create"));
    }

    @Test
    void receptionistCanManageAppointmentsButNotUsers() {
        Map<String, Map<String, Boolean>> perms = RolePermissionService.defaultPermissions(UserRole.RECEPTIONIST);
        assertTrue(perms.get("appointments").get("create"));
        assertFalse(perms.get("users").get("view"));
        assertTrue(perms.get("queue").get("edit"));
    }

    @Test
    void adminHasFullAccess() {
        Map<String, Map<String, Boolean>> perms = RolePermissionService.defaultPermissions(UserRole.ADMIN);
        perms.values().forEach(module -> module.values().forEach(flag -> assertTrue(flag)));
    }

    @Test
    void cashierLimitedToBillingAndReports() {
        Map<String, Map<String, Boolean>> perms = RolePermissionService.defaultPermissions(UserRole.CASHIER);
        assertTrue(perms.get("billing").get("edit"));
        assertFalse(perms.get("appointments").get("view"));
        assertTrue(perms.get("reports").get("export"));
    }
}
