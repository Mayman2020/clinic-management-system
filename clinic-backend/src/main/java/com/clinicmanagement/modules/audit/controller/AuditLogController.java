package com.clinicmanagement.modules.audit.controller;
import com.clinicmanagement.modules.audit.entity.AuditLog;
import com.clinicmanagement.modules.audit.service.AuditLogService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/audit-logs") @RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogService auditLogService;
    @GetMapping @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> list(Pageable pageable,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(auditLogService.list(pageable, q)));
    }
}
