package com.clinicmanagement.modules.branch.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class BranchContextResponse {
    private boolean multiBranchEnabled;
    private Long currentBranchId;
    private String currentBranchName;
    private List<BranchResponse> branches;
}
