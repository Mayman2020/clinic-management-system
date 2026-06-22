package com.clinicmanagement.modules.settings.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ClinicSettingDto {
    private Long id;
    @NotBlank private String settingKey;
    private String settingValue;
    private String description;
}
