package com.clinicmanagement.modules.billing.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "invoice_id") private Invoice invoice;
    @Column(nullable = false) private BigDecimal amount;
    @Column(name = "payment_method", nullable = false, length = 30) private String paymentMethod;
    @Column(name = "reference_no", length = 100) private String referenceNo;
    @Column(name = "paid_at") private LocalDateTime paidAt;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "created_by") private Long createdBy;
}
