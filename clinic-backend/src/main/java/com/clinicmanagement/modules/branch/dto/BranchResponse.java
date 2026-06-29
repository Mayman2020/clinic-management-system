package com.clinicmanagement.modules.branch.dto;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class BranchResponse {
    private Long id;
    private String branchCode;
    private String name;
    private String address;
    private String phone;
    private String email;
    private boolean isDefault;
    private boolean isActive;
}
