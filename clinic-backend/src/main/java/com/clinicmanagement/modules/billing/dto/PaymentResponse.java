package com.clinicmanagement.modules.billing.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class PaymentResponse {
    private Long id;
    private BigDecimal amount;
    private String paymentMethod;
    private String referenceNo;
    private LocalDateTime paidAt;
    private String notes;
}
