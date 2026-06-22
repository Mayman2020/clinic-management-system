package com.clinicmanagement.modules.radiology.dto;
import com.clinicmanagement.modules.radiology.entity.RadiologyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class RadiologyRequestDto {
    private Long id;
    private String requestNo;
    @NotNull private Long patientId;
    private Long doctorId;
    @NotBlank private String studyType;
    private RadiologyStatus status;
    private LocalDateTime scheduledAt;
    private String reportText;
    private String imageUrl;
    private String notes;
    private LocalDateTime completedAt;
}
