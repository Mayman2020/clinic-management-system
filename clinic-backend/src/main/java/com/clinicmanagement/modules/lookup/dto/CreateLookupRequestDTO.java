package com.clinicmanagement.modules.lookup.dto;

import com.clinicmanagement.modules.lookup.entity.LookupType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLookupRequestDTO {
    @NotNull private LookupType type;
    private String code;
    @NotBlank private String nameAr;
    @NotBlank private String nameEn;
    private Integer sortOrder;
}
