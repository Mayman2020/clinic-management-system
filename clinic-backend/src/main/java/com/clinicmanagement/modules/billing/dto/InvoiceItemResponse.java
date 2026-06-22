package com.clinicmanagement.modules.billing.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class InvoiceItemResponse {
    private Long id;
    private String itemType;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Long referenceId;
}
