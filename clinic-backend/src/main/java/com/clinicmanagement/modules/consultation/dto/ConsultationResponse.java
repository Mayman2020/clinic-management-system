package com.clinicmanagement.modules.consultation.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class ConsultationResponse {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String status;
    private LocalDateTime createdAt;
}
