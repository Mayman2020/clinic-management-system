package com.clinicmanagement.modules.lookup.controller;

import com.clinicmanagement.modules.lookup.dto.CreateLookupRequestDTO;
import com.clinicmanagement.modules.lookup.dto.LookupResponseDTO;
import com.clinicmanagement.modules.lookup.dto.UpdateLookupRequestDTO;
import com.clinicmanagement.modules.lookup.entity.LookupType;
import com.clinicmanagement.modules.lookup.service.LookupService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lookups")
@RequiredArgsConstructor
public class LookupController {
    private final LookupService lookupService;

    @GetMapping("/by-type")
    public ResponseEntity<ApiResponse<List<LookupResponseDTO>>> getByType(@RequestParam LookupType type) {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.getByType(type)));
    }

    @GetMapping("/admin/by-type")
    @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<LookupResponseDTO>>> getAllByType(@RequestParam LookupType type) {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.getAllByType(type)));
    }

    @PostMapping
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<LookupResponseDTO>> create(@Valid @RequestBody CreateLookupRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(lookupService.create(request)));
    }

    @PutMapping("/{id}")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<LookupResponseDTO>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateLookupRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        lookupService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
