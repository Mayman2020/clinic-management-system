package com.clinicmanagement.modules.queue.dto;
import com.clinicmanagement.modules.queue.entity.QueueStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class QueueTokenResponse {
    private Long id;
    private Integer tokenNumber;
    private LocalDate queueDate;
    private Long doctorId;
    private String department;
    private Long patientId;
    private String patientName;
    private String doctorName;
    private Long appointmentId;
    private QueueStatus status;
    private Integer estimatedWaitMinutes;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
}
