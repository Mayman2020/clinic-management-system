package com.clinicmanagement.modules.permission.service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.clinicmanagement.modules.permission.dto.RolePermissionResponseDTO;
import com.clinicmanagement.modules.permission.dto.RolePermissionUpdateRequestDTO;
import com.clinicmanagement.modules.permission.entity.RolePermissionEntity;
import com.clinicmanagement.modules.permission.repository.RolePermissionRepository;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.modules.user.entity.UserRole;
import com.clinicmanagement.shared.exception.AppException;
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
            case ADMIN -> permissions.replaceAll((k,v) -> fillTrue(v));
            case RECEPTIONIST -> permissions.replaceAll((k,v) -> fillTrue(v));
            case DOCTOR -> permissions.replaceAll((k,v) -> fillTrue(v));
            case NURSE -> permissions.replaceAll((k,v) -> fillTrue(v));
            case LAB_TECHNICIAN -> permissions.replaceAll((k,v) -> fillTrue(v));
            case RADIOLOGY_STAFF -> permissions.replaceAll((k,v) -> fillTrue(v));
            case CASHIER -> permissions.replaceAll((k,v) -> fillTrue(v));
            default -> { }
        }
        return permissions;
    }

    private static Map<String, Map<String, Boolean>> baseCatalog() {
        String[] modules = { "dashboard", "patients", "doctors", "appointments", "queue", "calendar", "consultation", "prescription", "lab", "radiology", "billing", "insurance", "reports", "settings", "users", "permissions" };
        String[] actions = { "enabled", "menu", "view", "create", "edit", "delete", "export", "approve" };
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
