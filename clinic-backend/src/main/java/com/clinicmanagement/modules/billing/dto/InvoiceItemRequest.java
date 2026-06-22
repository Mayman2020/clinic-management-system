package com.clinicmanagement.modules.billing.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvoiceItemRequest {
    @NotBlank private String itemType;
    @NotBlank private String description;
    private BigDecimal quantity;
    @NotNull private BigDecimal unitPrice;
    private Long referenceId;
}
