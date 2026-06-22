package com.clinicmanagement.modules.billing.dto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class InvoiceRequest {
    @NotNull private Long patientId;
    private BigDecimal discount;
    private BigDecimal tax;
    private String notes;
    @NotEmpty private List<InvoiceItemRequest> items;
}
