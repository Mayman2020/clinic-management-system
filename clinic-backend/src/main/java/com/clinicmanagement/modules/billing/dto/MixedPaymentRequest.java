package com.clinicmanagement.modules.billing.dto;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class MixedPaymentRequest {
    @NotEmpty private List<PaymentRequest> payments;
}
