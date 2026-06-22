package com.clinicmanagement.modules.patients.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "patients") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "patient_code", unique = true, nullable = false, length = 30) private String patientCode;
    @Column(name = "first_name", nullable = false, length = 100) private String firstName;
    @Column(name = "last_name", nullable = false, length = 100) private String lastName;
    @Column(name = "national_id", length = 50) private String nationalId;
    @Column(name = "passport_number", length = 50) private String passportNumber;
    @Column(name = "date_of_birth") private LocalDate dateOfBirth;
    @Column(length = 10) private String gender;
    @Column(length = 20) private String phone;
    @Column(length = 150) private String email;
    @Column(columnDefinition = "TEXT") private String address;
    @Column(name = "emergency_contact_name", length = 150) private String emergencyContactName;
    @Column(name = "emergency_contact_phone", length = 20) private String emergencyContactPhone;
    @Column(name = "medical_history", columnDefinition = "TEXT") private String medicalHistory;
    @Column(columnDefinition = "TEXT") private String allergies;
    @Column(name = "chronic_diseases", columnDefinition = "TEXT") private String chronicDiseases;
    @Column(name = "insurance_provider_id") private Long insuranceProviderId;
    @Column(name = "insurance_policy_no", length = 100) private String insurancePolicyNo;
    @Column(columnDefinition = "TEXT") private String notes;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedBy @Column(name = "created_by", updatable = false) private Long createdBy;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
