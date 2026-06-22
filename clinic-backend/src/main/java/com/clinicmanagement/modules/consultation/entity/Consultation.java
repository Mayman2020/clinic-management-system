package com.clinicmanagement.modules.consultation.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "consultations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Consultation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "appointment_id") private Long appointmentId;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(columnDefinition = "TEXT") private String symptoms;
    @Column(columnDefinition = "TEXT") private String diagnosis;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "treatment_plan", columnDefinition = "TEXT") private String treatmentPlan;
    @Column(name = "follow_up_date") private LocalDate followUpDate;
    @Column(length = 20) private String status;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
