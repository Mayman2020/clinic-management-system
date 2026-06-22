package com.clinicmanagement.modules.settings.controller;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.modules.settings.dto.ClinicSettingDto;
import com.clinicmanagement.modules.settings.service.SettingsService;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/settings") @RequiredArgsConstructor
public class SettingsController {
    private final SettingsService settingsService;
    @GetMapping @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<ClinicSettingDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getAll()));
    }
    @GetMapping("/{key}") @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<ClinicSettingDto>> getByKey(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getByKey(key)));
    }
    @PutMapping @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<ClinicSettingDto>> upsert(@Valid @RequestBody ClinicSettingDto request) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.upsert(request)));
    }
}
