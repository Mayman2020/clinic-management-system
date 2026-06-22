package com.clinicmanagement.modules.prescription.dto;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class PrescriptionItemResponse {
    private Long id;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String notes;
}
