package com.clinicmanagement.modules.billing.service;
import com.clinicmanagement.shared.util.SearchQueryUtil;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.billing.dto.*;
import com.clinicmanagement.modules.billing.entity.*;
import com.clinicmanagement.modules.billing.repository.InvoiceRepository;
import com.clinicmanagement.modules.billing.repository.InvoiceItemRepository;
import com.clinicmanagement.modules.billing.repository.PaymentRepository;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.settings.service.SettingsService;
import com.clinicmanagement.shared.branch.BranchContextService;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service @RequiredArgsConstructor
public class BillingService {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final PaymentRepository paymentRepository;
    private final PatientRepository patientRepository;
    private final SettingsService settingsService;
    private final BranchContextService branchContext;

    public Page<InvoiceResponse> list(Pageable pageable, String q, String status) {
        return invoiceRepository.search(trim(q), blankToNull(status), branchContext.getFilterBranchId(), pageable).map(this::toResponse);
    }

    public Page<InvoiceResponse> byPatient(Long patientId, Pageable pageable) {
        Long branchId = branchContext.getFilterBranchId();
        if (branchId != null) {
            return invoiceRepository.findByPatientIdAndBranchIdOrderByCreatedAtDesc(patientId, branchId, pageable).map(this::toResponse);
        }
        return invoiceRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable).map(this::toResponse);
    }

    public InvoiceResponse getById(Long id) {
        return toResponse(requireInvoice(id));
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
            .paidAmount(BigDecimal.ZERO).notes(request.getNotes())
            .branchId(branchContext.requireBranchIdForWrite()).build();
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
        Invoice invoice = requireInvoice(invoiceId);
        BigDecimal paid = invoice.getPaidAmount() == null ? BigDecimal.ZERO : invoice.getPaidAmount();
        BigDecimal total = invoice.getTotal() == null ? BigDecimal.ZERO : invoice.getTotal();
        for (PaymentRequest pr : request.getPayments()) {
            BigDecimal amount = pr.getAmount();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw AppException.badRequest("Payment amount must be positive");
            }
            BigDecimal remaining = total.subtract(paid);
            if (amount.compareTo(remaining) > 0) {
                throw AppException.badRequest("Payment exceeds remaining invoice balance");
            }
            Payment payment = Payment.builder().invoice(invoice).amount(amount)
                .paymentMethod(pr.getPaymentMethod()).referenceNo(pr.getReferenceNo())
                .paidAt(LocalDateTime.now()).notes(pr.getNotes()).createdBy(userId).build();
            invoice.getPayments().add(payment);
            paid = paid.add(amount);
        }
        invoice.setPaidAmount(paid);
        if (paid.compareTo(invoice.getTotal()) >= 0) invoice.setStatus("PAID");
        else if (paid.compareTo(BigDecimal.ZERO) > 0) invoice.setStatus("PARTIAL");
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public Optional<InvoiceResponse> createServiceLineIfAbsent(Long patientId, String itemType, String description,
            BigDecimal unitPrice, Long referenceId) {
        return createServiceLineIfAbsent(patientId, null, itemType, description, unitPrice, referenceId);
    }

    @Transactional
    public Optional<InvoiceResponse> createServiceLineIfAbsent(Long patientId, Long consultationId, String itemType,
            String description, BigDecimal unitPrice, Long referenceId) {
        if (referenceId != null && invoiceItemRepository.existsByItemTypeAndReferenceId(itemType, referenceId)) {
            return invoiceItemRepository.findByItemTypeAndReferenceId(itemType, referenceId)
                .map(item -> getById(item.getInvoice().getId()));
        }
        BigDecimal price = unitPrice != null ? unitPrice : BigDecimal.ZERO;
        Invoice invoice = consultationId != null
            ? getOrCreateConsultationInvoice(consultationId, patientId)
            : createStandaloneServiceInvoice(patientId, description);
        addLineAndRecalculate(invoice, itemType, description, price, referenceId);
        return Optional.of(getById(invoice.getId()));
    }

    @Transactional
    public Invoice getOrCreateConsultationInvoice(Long consultationId, Long patientId) {
        return invoiceRepository.findByConsultationId(consultationId).orElseGet(() -> {
            Invoice invoice = Invoice.builder()
                .invoiceNo("INV-" + String.format("%06d", invoiceRepository.count() + 1))
                .patientId(patientId).consultationId(consultationId).status("PENDING")
                .discount(BigDecimal.ZERO).tax(BigDecimal.ZERO).paidAmount(BigDecimal.ZERO)
                .subtotal(BigDecimal.ZERO).total(BigDecimal.ZERO)
                .notes("Visit invoice — consultation #" + consultationId)
                .branchId(branchContext.requireBranchIdForWrite()).build();
            return invoiceRepository.save(invoice);
        });
    }

    @Transactional
    public InvoiceResponse addLineIfAbsent(Long invoiceId, String itemType, String description,
            BigDecimal unitPrice, Long referenceId) {
        if (referenceId != null && invoiceItemRepository.existsByItemTypeAndReferenceId(itemType, referenceId)) {
            return getById(invoiceId);
        }
        Invoice invoice = requireInvoice(invoiceId);
        addLineAndRecalculate(invoice, itemType, description, unitPrice != null ? unitPrice : BigDecimal.ZERO, referenceId);
        return getById(invoice.getId());
    }

    public Page<PaymentResponse> listPayments(Pageable pageable) {
        return paymentRepository.findAllOrdered(branchContext.getFilterBranchId(), pageable)
            .map(p -> PaymentResponse.builder().id(p.getId()).amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod()).referenceNo(p.getReferenceNo())
                .paidAt(p.getPaidAt()).notes(p.getNotes()).build());
    }

    public List<PaymentResponse> paymentsByInvoice(Long invoiceId) {
        requireInvoice(invoiceId);
        return paymentRepository.findByInvoiceIdOrderByPaidAtDesc(invoiceId).stream()
            .map(p -> PaymentResponse.builder().id(p.getId()).amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod()).referenceNo(p.getReferenceNo())
                .paidAt(p.getPaidAt()).notes(p.getNotes()).build()).toList();
    }

    private Invoice createStandaloneServiceInvoice(Long patientId, String description) {
        Invoice invoice = Invoice.builder()
            .invoiceNo("INV-" + String.format("%06d", invoiceRepository.count() + 1))
            .patientId(patientId).status("PENDING").discount(BigDecimal.ZERO).tax(BigDecimal.ZERO)
            .paidAmount(BigDecimal.ZERO).subtotal(BigDecimal.ZERO).total(BigDecimal.ZERO)
            .notes(description).branchId(branchContext.requireBranchIdForWrite()).build();
        return invoiceRepository.save(invoice);
    }

    private void addLineAndRecalculate(Invoice invoice, String itemType, String description,
            BigDecimal unitPrice, Long referenceId) {
        BigDecimal lineTotal = unitPrice;
        InvoiceItem item = InvoiceItem.builder().invoice(invoice).itemType(itemType)
            .description(description).quantity(BigDecimal.ONE).unitPrice(unitPrice)
            .totalPrice(lineTotal).referenceId(referenceId).build();
        invoice.getItems().add(item);
        BigDecimal subtotal = invoice.getSubtotal() == null ? BigDecimal.ZERO : invoice.getSubtotal();
        subtotal = subtotal.add(lineTotal);
        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal.subtract(nz(invoice.getDiscount())).add(nz(invoice.getTax())));
        invoiceRepository.save(invoice);
    }

    public BigDecimal resolveDefaultFee(String settingKey, BigDecimal fallback) {
        String raw = settingsService.resolveValue(settingKey, fallback.toPlainString());
        try {
            return new BigDecimal(raw);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private static String trim(String q) { return SearchQueryUtil.normalize(q); }
    private static String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }

    private Invoice requireInvoice(Long id) {
        Invoice invoice = invoiceRepository.findWithDetailsById(id)
            .orElseThrow(() -> AppException.notFound("Invoice not found"));
        Long branchFilter = branchContext.getFilterBranchId();
        if (branchFilter != null && invoice.getBranchId() != null && !branchFilter.equals(invoice.getBranchId())) {
            throw AppException.notFound("Invoice not found");
        }
        return invoice;
    }

    public InvoiceResponse toResponse(Invoice i) {
        String patientName = patientRepository.findById(i.getPatientId())
            .map(p -> p.getFirstName() + " " + p.getLastName()).orElse(null);
        return InvoiceResponse.builder().id(i.getId()).invoiceNo(i.getInvoiceNo()).patientId(i.getPatientId())
            .patientName(patientName).consultationId(i.getConsultationId())
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
