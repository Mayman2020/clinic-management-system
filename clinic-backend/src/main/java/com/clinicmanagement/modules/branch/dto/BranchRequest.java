package com.clinicmanagement.modules.branch.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchRequest {
    @NotBlank private String branchCode;
    @NotBlank private String name;
    private String address;
    private String phone;
    private String email;
    private Boolean isDefault;
    private Boolean isActive;
}
