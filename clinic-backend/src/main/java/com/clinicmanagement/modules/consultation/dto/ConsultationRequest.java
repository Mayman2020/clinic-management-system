package com.clinicmanagement.modules.consultation.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ConsultationRequest {
    private Long appointmentId;
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String status;
}
