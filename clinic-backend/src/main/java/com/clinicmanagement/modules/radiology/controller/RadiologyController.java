package com.clinicmanagement.modules.radiology.controller;
import com.clinicmanagement.modules.radiology.dto.RadiologyRequestDto;
import com.clinicmanagement.modules.radiology.entity.RadiologyStatus;
import com.clinicmanagement.modules.radiology.service.RadiologyService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController @RequestMapping("/radiology") @RequiredArgsConstructor
public class RadiologyController {
    private final RadiologyService radiologyService;
    @GetMapping("/requests") @RequiresPermission(module = "radiology", action = "view")
    public ResponseEntity<ApiResponse<Page<RadiologyRequestDto>>> list(Pageable pageable,
            @RequestParam(required = false) RadiologyStatus status, @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.list(pageable, status, q)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "radiology", action = "view")
    public ResponseEntity<ApiResponse<RadiologyRequestDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.getById(id)));
    }
    @GetMapping("/patient/{patientId}") @RequiresPermission(module = "radiology", action = "view")
    public ResponseEntity<ApiResponse<List<RadiologyRequestDto>>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.byPatient(patientId)));
    }
    @PostMapping @RequiresPermission(module = "radiology", action = "create")
    public ResponseEntity<ApiResponse<RadiologyRequestDto>> create(@Valid @RequestBody RadiologyRequestDto request) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.create(request)));
    }
    @PatchMapping("/{id}/status") @RequiresPermission(module = "radiology", action = "edit")
    public ResponseEntity<ApiResponse<RadiologyRequestDto>> updateStatus(@PathVariable Long id,
            @RequestParam RadiologyStatus status,
            @RequestParam(required = false) String reportText,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledAt) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.updateStatus(id, status, reportText, imageUrl, scheduledAt)));
    }
}
