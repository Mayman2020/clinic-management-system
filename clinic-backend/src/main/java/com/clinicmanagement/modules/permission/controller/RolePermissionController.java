package com.clinicmanagement.modules.permission.controller;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.modules.permission.dto.RolePermissionResponseDTO;
import com.clinicmanagement.modules.permission.dto.RolePermissionUpdateRequestDTO;
import com.clinicmanagement.modules.permission.service.RolePermissionService;
import com.clinicmanagement.modules.user.entity.UserRole;
import com.clinicmanagement.shared.response.ApiResponse;
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
