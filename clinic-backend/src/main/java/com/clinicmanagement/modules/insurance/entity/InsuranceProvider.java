package com.clinicmanagement.modules.insurance.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "insurance_providers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InsuranceProvider {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 200) private String name;
    @Column(name = "contact_phone", length = 20) private String contactPhone;
    @Column(name = "contact_email", length = 150) private String contactEmail;
    @Column(name = "coverage_notes", columnDefinition = "TEXT") private String coverageNotes;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
