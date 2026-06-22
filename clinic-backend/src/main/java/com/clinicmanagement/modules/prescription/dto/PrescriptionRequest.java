package com.clinicmanagement.modules.prescription.dto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class PrescriptionRequest {
    private Long consultationId;
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    private String notes;
    @NotEmpty private List<PrescriptionItemRequest> items;
}
