package com.clinicmanagement.modules.branch.service;
import com.clinicmanagement.modules.branch.dto.*;
import com.clinicmanagement.modules.branch.entity.Branch;
import com.clinicmanagement.modules.branch.repository.BranchRepository;
import com.clinicmanagement.shared.branch.BranchContextService;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class BranchService {
    private final BranchRepository repository;
    private final BranchContextService branchContext;

    public List<BranchResponse> listActive() {
        return repository.findByActiveTrueOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    public BranchContextResponse getContext() {
        Long currentId = branchContext.getCurrentBranchId();
        Branch current = repository.findById(currentId).orElseThrow(() -> AppException.notFound("Branch not found"));
        return BranchContextResponse.builder()
            .multiBranchEnabled(branchContext.isMultiBranchEnabled())
            .currentBranchId(current.getId())
            .currentBranchName(current.getName())
            .branches(listActive())
            .build();
    }

    @Transactional
    public BranchResponse create(BranchRequest request) {
        if (repository.existsByBranchCodeIgnoreCase(request.getBranchCode())) {
            throw AppException.conflict("Branch code already exists", "BRANCH_CODE_EXISTS");
        }
        Branch branch = Branch.builder()
            .branchCode(request.getBranchCode().trim().toUpperCase())
            .name(request.getName().trim())
            .address(request.getAddress())
            .phone(request.getPhone())
            .email(request.getEmail())
            .defaultBranch(Boolean.TRUE.equals(request.getIsDefault()))
            .active(request.getIsActive() == null || request.getIsActive())
            .build();
        if (branch.isDefaultBranch()) clearDefaultFlag();
        return toResponse(repository.save(branch));
    }

    @Transactional
    public BranchResponse update(Long id, BranchRequest request) {
        Branch branch = repository.findById(id).orElseThrow(() -> AppException.notFound("Branch not found"));
        branch.setName(request.getName().trim());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        if (request.getIsActive() != null) branch.setActive(request.getIsActive());
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultFlag();
            branch.setDefaultBranch(true);
        }
        return toResponse(repository.save(branch));
    }

    private void clearDefaultFlag() {
        repository.findByDefaultBranchTrue().ifPresent(b -> { b.setDefaultBranch(false); repository.save(b); });
    }

    public BranchResponse toResponse(Branch b) {
        return BranchResponse.builder().id(b.getId()).branchCode(b.getBranchCode()).name(b.getName())
            .address(b.getAddress()).phone(b.getPhone()).email(b.getEmail())
            .isDefault(b.isDefaultBranch()).isActive(b.isActive()).build();
    }
}
