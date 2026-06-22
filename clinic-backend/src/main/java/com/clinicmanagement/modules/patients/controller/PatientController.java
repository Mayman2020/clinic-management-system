package com.clinicmanagement.modules.patients.controller;
import com.clinicmanagement.modules.patients.dto.*;
import com.clinicmanagement.modules.patients.service.PatientService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/patients") @RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
    @GetMapping @RequiresPermission(module = "patients", action = "view")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> search(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.search(q, active, pageable)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "patients", action = "view")
    public ResponseEntity<ApiResponse<PatientResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getById(id)));
    }
    @PostMapping @RequiresPermission(module = "patients", action = "create")
    public ResponseEntity<ApiResponse<PatientResponse>> create(@Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.create(request)));
    }
    @PutMapping("/{id}") @RequiresPermission(module = "patients", action = "edit")
    public ResponseEntity<ApiResponse<PatientResponse>> update(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.update(id, request)));
    }
    @PostMapping("/{id}/archive") @RequiresPermission(module = "patients", action = "delete")
    public ResponseEntity<ApiResponse<Void>> archive(@PathVariable Long id) {
        patientService.archive(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
    @GetMapping("/{id}/documents") @RequiresPermission(module = "patients", action = "view")
    public ResponseEntity<ApiResponse<List<PatientDocumentResponse>>> listDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listDocuments(id)));
    }
    @PostMapping("/documents") @RequiresPermission(module = "patients", action = "edit")
    public ResponseEntity<ApiResponse<PatientDocumentResponse>> addDocument(@Valid @RequestBody PatientDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.addDocument(request)));
    }
}
