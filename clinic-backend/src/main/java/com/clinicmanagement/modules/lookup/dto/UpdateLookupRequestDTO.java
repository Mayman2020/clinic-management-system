package com.clinicmanagement.modules.lookup.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateLookupRequestDTO {
    @NotBlank private String code;
    @NotBlank private String nameAr;
    @NotBlank private String nameEn;
    private Integer sortOrder;
    private boolean active;
}
