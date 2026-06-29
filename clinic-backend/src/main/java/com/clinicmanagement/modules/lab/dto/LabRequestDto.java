package com.clinicmanagement.modules.lab.dto;
import com.clinicmanagement.modules.lab.entity.LabStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class LabRequestDto {
    private Long id;
    private String requestNo;
    @NotNull private Long patientId;
    private Long doctorId;
    private Long consultationId;
    @NotBlank private String testType;
    private String testCategory;
    private LabStatus status;
    private String resultPdfUrl;
    private String notes;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private Long generatedInvoiceId;
}
