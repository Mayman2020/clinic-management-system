package com.clinicmanagement.modules.insurance.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "claims")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Claim {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "claim_no", unique = true, nullable = false, length = 30) private String claimNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "provider_id") private Long providerId;
    @Column(name = "invoice_id") private Long invoiceId;
    @Column(nullable = false) private BigDecimal amount;
    private BigDecimal copayment;
    @Column(length = 30) private String status;
    @Column(name = "submitted_at") private LocalDateTime submittedAt;
    @Column(name = "approved_at") private LocalDateTime approvedAt;
    @Column(columnDefinition = "TEXT") private String notes;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
