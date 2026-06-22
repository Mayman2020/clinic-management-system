package com.clinicmanagement.modules.prescription.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class PrescriptionResponse {
    private Long id;
    private String prescriptionNo;
    private Long consultationId;
    private Long patientId;
    private Long doctorId;
    private String notes;
    private String status;
    private List<PrescriptionItemResponse> items;
    private LocalDateTime createdAt;
}
