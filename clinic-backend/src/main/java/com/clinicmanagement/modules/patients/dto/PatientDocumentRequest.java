package com.clinicmanagement.modules.patients.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientDocumentRequest {
    @NotNull private Long patientId;
    @NotBlank private String fileName;
    @NotBlank private String fileUrl;
    private String documentType;
}
