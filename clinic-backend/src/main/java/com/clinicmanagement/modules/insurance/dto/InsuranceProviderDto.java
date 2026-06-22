package com.clinicmanagement.modules.insurance.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class InsuranceProviderDto {
    private Long id;
    @NotBlank private String name;
    private String contactPhone;
    private String contactEmail;
    private String coverageNotes;
    private Boolean active;
}
