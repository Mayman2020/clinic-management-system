package com.clinicmanagement.modules.lab.controller;
import com.clinicmanagement.modules.lab.dto.LabRequestDto;
import com.clinicmanagement.modules.lab.entity.LabStatus;
import com.clinicmanagement.modules.lab.service.LabService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/lab") @RequiredArgsConstructor
public class LabController {
    private final LabService labService;
    @GetMapping("/requests") @RequiresPermission(module = "lab", action = "view")
    public ResponseEntity<ApiResponse<Page<LabRequestDto>>> list(Pageable pageable,
            @RequestParam(required = false) LabStatus status, @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(labService.list(pageable, status, q)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "lab", action = "view")
    public ResponseEntity<ApiResponse<LabRequestDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(labService.getById(id)));
    }
    @GetMapping("/patient/{patientId}") @RequiresPermission(module = "lab", action = "view")
    public ResponseEntity<ApiResponse<List<LabRequestDto>>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(labService.byPatient(patientId)));
    }
    @GetMapping("/status/{status}") @RequiresPermission(module = "lab", action = "view")
    public ResponseEntity<ApiResponse<List<LabRequestDto>>> byStatus(@PathVariable LabStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(labService.byStatus(status)));
    }
    @PostMapping @RequiresPermission(module = "lab", action = "create")
    public ResponseEntity<ApiResponse<LabRequestDto>> create(@Valid @RequestBody LabRequestDto request) {
        return ResponseEntity.ok(ApiResponse.ok(labService.create(request)));
    }
    @PatchMapping("/{id}/status") @RequiresPermission(module = "lab", action = "edit")
    public ResponseEntity<ApiResponse<LabRequestDto>> updateStatus(@PathVariable Long id,
            @RequestParam LabStatus status, @RequestParam(required = false) String resultPdfUrl) {
        return ResponseEntity.ok(ApiResponse.ok(labService.updateStatus(id, status, resultPdfUrl)));
    }
}
