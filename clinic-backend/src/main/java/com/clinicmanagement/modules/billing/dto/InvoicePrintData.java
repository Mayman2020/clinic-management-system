package com.clinicmanagement.modules.billing.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class InvoicePrintData {
    private String invoiceNo;
    private String patientName;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;
    private String clinicName;
    private String clinicPhone;
    private String clinicAddress;
    private String consultationTitle;
    private String doctorName;
    private String doctorSpecialty;
    private String patientPhone;
    private String patientDob;
    private String patientAge;
    private LocalDateTime consultationDateTime;
}
