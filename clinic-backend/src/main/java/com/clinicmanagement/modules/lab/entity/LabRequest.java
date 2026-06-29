package com.clinicmanagement.modules.lab.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "lab_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LabRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "request_no", unique = true, nullable = false, length = 30) private String requestNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id") private Long doctorId;
    @Column(name = "consultation_id") private Long consultationId;
    @Column(name = "test_type", nullable = false, length = 100) private String testType;
    @Column(name = "test_category", length = 50) private String testCategory;
    @Enumerated(EnumType.STRING) @Column(length = 30) private LabStatus status;
    @Column(name = "result_pdf_url", length = 500) private String resultPdfUrl;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "requested_at") private LocalDateTime requestedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
