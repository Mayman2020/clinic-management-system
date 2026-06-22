package com.clinicmanagement.modules.prescription.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrescriptionItemRequest {
    @NotBlank private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String notes;
}
