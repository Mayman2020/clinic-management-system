package com.clinicmanagement.modules.prescription.controller;
import com.clinicmanagement.modules.prescription.dto.*;
import com.clinicmanagement.modules.prescription.service.PrescriptionService;
import com.clinicmanagement.modules.prescription.service.PrescriptionPdfService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/prescriptions") @RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService prescriptionService;
    private final PrescriptionPdfService prescriptionPdfService;
    @GetMapping @RequiresPermission(module = "prescription", action = "view")
    public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> list(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.list(pageable, q, status)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "prescription", action = "view")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getById(id)));
    }
    @GetMapping("/{id}/print") @RequiresPermission(module = "prescription", action = "export")
    public ResponseEntity<ApiResponse<PrescriptionPrintData>> print(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getPrintData(id)));
    }
    @GetMapping("/{id}/pdf") @RequiresPermission(module = "prescription", action = "export")
    public ResponseEntity<byte[]> pdf(@PathVariable Long id) {
        byte[] pdf = prescriptionPdfService.generate(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"prescription-" + id + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }
    @PostMapping @RequiresPermission(module = "prescription", action = "create")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> create(@Valid @RequestBody PrescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.create(request)));
    }
}
