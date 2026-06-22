package com.clinicmanagement.modules.queue.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class QueueTokenRequest {
    @NotNull private LocalDate queueDate;
    private Long doctorId;
    private String department;
    private Long patientId;
    private Long appointmentId;
}
