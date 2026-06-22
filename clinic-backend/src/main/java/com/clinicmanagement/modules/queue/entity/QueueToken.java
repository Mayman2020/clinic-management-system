package com.clinicmanagement.modules.queue.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "queue_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QueueToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "token_number", nullable = false) private Integer tokenNumber;
    @Column(name = "queue_date", nullable = false) private LocalDate queueDate;
    @Column(name = "doctor_id") private Long doctorId;
    @Column(length = 100) private String department;
    @Column(name = "patient_id") private Long patientId;
    @Column(name = "appointment_id") private Long appointmentId;
    @Enumerated(EnumType.STRING) @Column(length = 20) private QueueStatus status;
    @Column(name = "estimated_wait_minutes") private Integer estimatedWaitMinutes;
    @Column(name = "called_at") private LocalDateTime calledAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
