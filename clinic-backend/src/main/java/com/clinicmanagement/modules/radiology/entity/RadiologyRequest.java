package com.clinicmanagement.modules.radiology.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "radiology_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RadiologyRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "request_no", unique = true, nullable = false, length = 30) private String requestNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id") private Long doctorId;
    @Column(name = "consultation_id") private Long consultationId;
    @Column(name = "study_type", nullable = false, length = 100) private String studyType;
    @Enumerated(EnumType.STRING) @Column(length = 30) private RadiologyStatus status;
    @Column(name = "scheduled_at") private LocalDateTime scheduledAt;
    @Column(name = "report_text", columnDefinition = "TEXT") private String reportText;
    @Column(name = "image_url", length = 500) private String imageUrl;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
