package com.clinicmanagement.modules.branch.controller;
import com.clinicmanagement.modules.branch.dto.*;
import com.clinicmanagement.modules.branch.service.BranchService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/branches") @RequiredArgsConstructor
public class BranchController {
    private final BranchService branchService;

    @GetMapping("/context")
    public ResponseEntity<ApiResponse<BranchContextResponse>> context() {
        return ResponseEntity.ok(ApiResponse.ok(branchService.getContext()));
    }

    @GetMapping @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<BranchResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(branchService.listActive()));
    }

    @PostMapping @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<BranchResponse>> create(@Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(branchService.create(request)));
    }

    @PutMapping("/{id}") @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<BranchResponse>> update(@PathVariable Long id, @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(branchService.update(id, request)));
    }
}
