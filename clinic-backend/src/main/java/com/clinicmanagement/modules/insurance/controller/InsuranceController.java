package com.clinicmanagement.modules.insurance.controller;
import com.clinicmanagement.modules.insurance.dto.*;
import com.clinicmanagement.modules.insurance.service.InsuranceService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/insurance") @RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;
    @GetMapping("/providers") @RequiresPermission(module = "insurance", action = "view")
    public ResponseEntity<ApiResponse<List<InsuranceProviderDto>>> listProviders() {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.listProviders()));
    }
    @PostMapping("/providers") @RequiresPermission(module = "insurance", action = "create")
    public ResponseEntity<ApiResponse<InsuranceProviderDto>> createProvider(@Valid @RequestBody InsuranceProviderDto request) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.createProvider(request)));
    }
    @GetMapping("/providers/{id}") @RequiresPermission(module = "insurance", action = "view")
    public ResponseEntity<ApiResponse<InsuranceProviderDto>> getProvider(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.getProvider(id)));
    }
    @PutMapping("/providers/{id}") @RequiresPermission(module = "insurance", action = "edit")
    public ResponseEntity<ApiResponse<InsuranceProviderDto>> updateProvider(@PathVariable Long id, @Valid @RequestBody InsuranceProviderDto request) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.updateProvider(id, request)));
    }
    @DeleteMapping("/providers/{id}") @RequiresPermission(module = "insurance", action = "delete")
    public ResponseEntity<ApiResponse<Void>> deactivateProvider(@PathVariable Long id) {
        insuranceService.deactivateProvider(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
    @GetMapping("/claims") @RequiresPermission(module = "insurance", action = "view")
    public ResponseEntity<ApiResponse<Page<ClaimDto>>> listClaims(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.listClaims(pageable, q, status)));
    }
    @GetMapping("/claims/{id}") @RequiresPermission(module = "insurance", action = "view")
    public ResponseEntity<ApiResponse<ClaimDto>> getClaim(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.getClaim(id)));
    }
    @PostMapping("/claims") @RequiresPermission(module = "insurance", action = "create")
    public ResponseEntity<ApiResponse<ClaimDto>> submitClaim(@Valid @RequestBody ClaimDto request) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.submitClaim(request)));
    }
    @PatchMapping("/claims/{id}/status") @RequiresPermission(module = "insurance", action = "approve")
    public ResponseEntity<ApiResponse<ClaimDto>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.updateClaimStatus(id, status)));
    }
}
