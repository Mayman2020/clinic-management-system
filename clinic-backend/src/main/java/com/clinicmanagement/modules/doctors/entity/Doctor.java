package com.clinicmanagement.modules.doctors.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "doctors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id") private Long userId;
    @Column(name = "doctor_code", unique = true, nullable = false, length = 30) private String doctorCode;
    @Column(name = "first_name", nullable = false, length = 100) private String firstName;
    @Column(name = "last_name", nullable = false, length = 100) private String lastName;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 50) private Specialty specialty;
    @Column(length = 100) private String department;
    @Column(length = 20) private String phone;
    @Column(length = 150) private String email;
    @Column(name = "consultation_fee") private BigDecimal consultationFee;
    @Column(columnDefinition = "TEXT") private String bio;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
