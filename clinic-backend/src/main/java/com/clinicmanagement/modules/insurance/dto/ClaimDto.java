package com.clinicmanagement.modules.insurance.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class ClaimDto {
    private Long id;
    private String claimNo;
    @NotNull private Long patientId;
    private Long providerId;
    private Long invoiceId;
    @NotNull private BigDecimal amount;
    private BigDecimal copayment;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private String notes;
}
