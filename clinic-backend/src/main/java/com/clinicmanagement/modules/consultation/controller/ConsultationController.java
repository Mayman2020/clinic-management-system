package com.clinicmanagement.modules.consultation.controller;
import com.clinicmanagement.modules.consultation.dto.*;
import com.clinicmanagement.modules.consultation.service.ConsultationService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/consultations") @RequiredArgsConstructor
public class ConsultationController {
    private final ConsultationService consultationService;
    @GetMapping @RequiresPermission(module = "consultation", action = "view")
    public ResponseEntity<ApiResponse<Page<ConsultationResponse>>> list(Pageable pageable,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.list(pageable, q)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "consultation", action = "view")
    public ResponseEntity<ApiResponse<ConsultationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getById(id)));
    }
    @GetMapping("/patient/{patientId}") @RequiresPermission(module = "consultation", action = "view")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.byPatient(patientId)));
    }
    @PostMapping @RequiresPermission(module = "consultation", action = "create")
    public ResponseEntity<ApiResponse<ConsultationResponse>> create(@Valid @RequestBody ConsultationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.create(request)));
    }
    @PutMapping("/{id}") @RequiresPermission(module = "consultation", action = "edit")
    public ResponseEntity<ApiResponse<ConsultationResponse>> update(@PathVariable Long id, @Valid @RequestBody ConsultationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.update(id, request)));
    }
}
