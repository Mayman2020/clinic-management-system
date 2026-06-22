package com.clinicmanagement.modules.patients.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class PatientDocumentResponse {
    private Long id;
    private Long patientId;
    private String fileName;
    private String fileUrl;
    private String documentType;
    private LocalDateTime uploadedAt;
}
