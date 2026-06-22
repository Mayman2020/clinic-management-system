package com.clinicmanagement.modules.billing.controller;
import com.clinicmanagement.modules.billing.dto.*;
import com.clinicmanagement.modules.billing.service.BillingService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/billing") @RequiredArgsConstructor
public class BillingController {
    private final BillingService billingService;
    @GetMapping("/invoices") @RequiresPermission(module = "billing", action = "view")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> list(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.list(pageable, q, status)));
    }
    @GetMapping("/invoices/{id}") @RequiresPermission(module = "billing", action = "view")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.getById(id)));
    }
    @GetMapping("/invoices/{id}/print") @RequiresPermission(module = "billing", action = "export")
    public ResponseEntity<ApiResponse<InvoicePrintData>> print(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.getPrintData(id)));
    }
    @PostMapping("/invoices") @RequiresPermission(module = "billing", action = "create")
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.create(request)));
    }
    @PostMapping("/invoices/{id}/payments/mixed") @RequiresPermission(module = "billing", action = "approve")
    public ResponseEntity<ApiResponse<InvoiceResponse>> mixedPayment(@PathVariable Long id, @Valid @RequestBody MixedPaymentRequest request) {
        Long userId = null;
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (p instanceof User u) userId = u.getId();
        return ResponseEntity.ok(ApiResponse.ok(billingService.addMixedPayment(id, request, userId)));
    }
}
