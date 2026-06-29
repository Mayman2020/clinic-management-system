package com.clinicmanagement.shared.branch;

import com.clinicmanagement.modules.branch.entity.Branch;
import com.clinicmanagement.modules.branch.repository.BranchRepository;
import com.clinicmanagement.modules.settings.service.SettingsService;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class BranchContextService {
    private final BranchRepository branchRepository;
    private final SettingsService settingsService;

    public boolean isMultiBranchEnabled() {
        return "true".equalsIgnoreCase(settingsService.resolveValue("multi_branch_enabled", "false"));
    }

    public Long getDefaultBranchId() {
        return branchRepository.findByDefaultBranchTrue().map(Branch::getId).orElse(1L);
    }

    public Long getCurrentBranchId() {
        Long fromHeader = BranchContextHolder.get();
        if (isMultiBranchEnabled() && fromHeader != null) {
            return branchRepository.findById(fromHeader)
                .filter(Branch::isActive)
                .map(Branch::getId)
                .orElseThrow(() -> AppException.badRequest("Invalid branch", "INVALID_BRANCH"));
        }
        return getDefaultBranchId();
    }

    /** Returns branch id for query filtering; null means no extra filter (legacy single-clinic). */
    public Long getFilterBranchId() {
        if (!isMultiBranchEnabled()) return null;
        return getCurrentBranchId();
    }

    public Long requireBranchIdForWrite() {
        return getCurrentBranchId();
    }
}
