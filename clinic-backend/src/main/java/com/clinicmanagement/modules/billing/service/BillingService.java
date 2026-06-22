package com.clinicmanagement.modules.billing.service;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.billing.dto.*;
import com.clinicmanagement.modules.billing.entity.*;
import com.clinicmanagement.modules.billing.repository.InvoiceRepository;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.settings.service.SettingsService;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class BillingService {
    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;
    private final SettingsService settingsService;

    public Page<InvoiceResponse> list(Pageable pageable, String q, String status) {
        return invoiceRepository.search(trim(q), blankToNull(status), pageable).map(this::toResponse);
    }

    public InvoiceResponse getById(Long id) {
        return toResponse(invoiceRepository.findWithDetailsById(id).orElseThrow(() -> AppException.notFound("Invoice not found")));
    }

    public InvoicePrintData getPrintData(Long id) {
        InvoiceResponse inv = getById(id);
        return InvoicePrintData.builder().invoiceNo(inv.getInvoiceNo()).patientName(inv.getPatientName())
            .status(inv.getStatus()).subtotal(inv.getSubtotal()).discount(inv.getDiscount()).tax(inv.getTax())
            .total(inv.getTotal()).paidAmount(inv.getPaidAmount()).items(inv.getItems())
            .createdAt(inv.getCreatedAt()).clinicName(settingsService.resolveValue("clinic_name", "Clinic Management System")).build();
    }

    @Transactional @Auditable(action = "CREATE", entityType = "Invoice")
    public InvoiceResponse create(InvoiceRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        Invoice invoice = Invoice.builder().invoiceNo("INV-" + String.format("%06d", invoiceRepository.count() + 1))
            .patientId(request.getPatientId()).status("PENDING")
            .discount(nz(request.getDiscount())).tax(nz(request.getTax()))
            .paidAmount(BigDecimal.ZERO).notes(request.getNotes()).build();
        for (InvoiceItemRequest ir : request.getItems()) {
            BigDecimal qty = ir.getQuantity() == null ? BigDecimal.ONE : ir.getQuantity();
            BigDecimal lineTotal = ir.getUnitPrice().multiply(qty);
            subtotal = subtotal.add(lineTotal);
            InvoiceItem item = InvoiceItem.builder().invoice(invoice).itemType(ir.getItemType())
                .description(ir.getDescription()).quantity(qty).unitPrice(ir.getUnitPrice())
                .totalPrice(lineTotal).referenceId(ir.getReferenceId()).build();
            invoice.getItems().add(item);
        }
        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal.subtract(invoice.getDiscount()).add(invoice.getTax()));
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "Invoice")
    public InvoiceResponse addMixedPayment(Long invoiceId, MixedPaymentRequest request, Long userId) {
        Invoice invoice = invoiceRepository.findWithDetailsById(invoiceId).orElseThrow(() -> AppException.notFound("Invoice not found"));
        BigDecimal paid = invoice.getPaidAmount() == null ? BigDecimal.ZERO : invoice.getPaidAmount();
        for (PaymentRequest pr : request.getPayments()) {
            Payment payment = Payment.builder().invoice(invoice).amount(pr.getAmount())
                .paymentMethod(pr.getPaymentMethod()).referenceNo(pr.getReferenceNo())
                .paidAt(LocalDateTime.now()).notes(pr.getNotes()).createdBy(userId).build();
            invoice.getPayments().add(payment);
            paid = paid.add(pr.getAmount());
        }
        invoice.setPaidAmount(paid);
        if (paid.compareTo(invoice.getTotal()) >= 0) invoice.setStatus("PAID");
        else if (paid.compareTo(BigDecimal.ZERO) > 0) invoice.setStatus("PARTIAL");
        return toResponse(invoiceRepository.save(invoice));
    }

    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }
    private static String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }

    public InvoiceResponse toResponse(Invoice i) {
        String patientName = patientRepository.findById(i.getPatientId())
            .map(p -> p.getFirstName() + " " + p.getLastName()).orElse(null);
        return InvoiceResponse.builder().id(i.getId()).invoiceNo(i.getInvoiceNo()).patientId(i.getPatientId())
            .patientName(patientName)
            .status(i.getStatus()).subtotal(i.getSubtotal()).discount(i.getDiscount()).tax(i.getTax())
            .total(i.getTotal()).paidAmount(i.getPaidAmount()).notes(i.getNotes()).createdAt(i.getCreatedAt())
            .items(i.getItems().stream().map(it -> InvoiceItemResponse.builder().id(it.getId())
                .itemType(it.getItemType()).description(it.getDescription()).quantity(it.getQuantity())
                .unitPrice(it.getUnitPrice()).totalPrice(it.getTotalPrice()).referenceId(it.getReferenceId()).build()).toList())
            .payments(i.getPayments().stream().map(p -> PaymentResponse.builder().id(p.getId()).amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod()).referenceNo(p.getReferenceNo())
                .paidAt(p.getPaidAt()).notes(p.getNotes()).build()).toList()).build();
    }
}
