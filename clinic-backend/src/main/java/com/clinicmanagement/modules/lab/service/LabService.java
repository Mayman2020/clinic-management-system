package com.clinicmanagement.modules.lab.service;
import com.clinicmanagement.shared.util.SearchQueryUtil;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.billing.service.BillingService;
import com.clinicmanagement.modules.lab.dto.LabRequestDto;
import com.clinicmanagement.modules.notification.entity.NotificationType;
import com.clinicmanagement.modules.notification.service.NotificationService;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.patients.entity.Patient;
import com.clinicmanagement.shared.mail.EmailService;
import com.clinicmanagement.shared.sms.SmsService;
import com.clinicmanagement.modules.lab.entity.*;
import com.clinicmanagement.modules.lab.repository.LabRequestRepository;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class LabService {
    private final LabRequestRepository repository;
    private final BillingService billingService;
    private final NotificationService notificationService;
    private final PatientRepository patientRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    public Page<LabRequestDto> list(Pageable pageable, LabStatus status, String q) {
        return repository.search(trim(q), status, pageable).map(this::toResponse);
    }

    public LabRequestDto getById(Long id) { return toResponse(find(id)); }
    public List<LabRequestDto> byPatient(Long patientId) {
        return repository.findByPatientIdOrderByRequestedAtDesc(patientId).stream().map(this::toResponse).toList();
    }
    public List<LabRequestDto> byStatus(LabStatus status) {
        return repository.findByStatus(status).stream().map(this::toResponse).toList();
    }

    @Transactional @Auditable(action = "CREATE", entityType = "LabRequest")
    public LabRequestDto create(LabRequestDto dto) {
        LabRequest r = LabRequest.builder().requestNo("LAB-" + String.format("%06d", repository.count() + 1))
            .patientId(dto.getPatientId()).doctorId(dto.getDoctorId()).consultationId(dto.getConsultationId())
            .testType(dto.getTestType())
            .testCategory(dto.getTestCategory()).status(LabStatus.REQUESTED).notes(dto.getNotes())
            .requestedAt(LocalDateTime.now()).build();
        return toResponse(repository.save(r));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "LabRequest")
    public LabRequestDto updateStatus(Long id, LabStatus status, String resultPdfUrl) {
        LabRequest r = find(id);
        validateTransition(r.getStatus(), status);
        r.setStatus(status);
        if (resultPdfUrl != null) r.setResultPdfUrl(resultPdfUrl);
        if (status == LabStatus.COMPLETED) r.setCompletedAt(LocalDateTime.now());
        LabRequest saved = repository.save(r);
        LabRequestDto response = toResponse(saved);
        if (status == LabStatus.COMPLETED) {
            BigDecimal fee = billingService.resolveDefaultFee("lab_default_fee", new BigDecimal("150"));
            billingService.createServiceLineIfAbsent(saved.getPatientId(), saved.getConsultationId(), "LAB",
                "Lab — " + saved.getTestType(), fee, saved.getId())
                .ifPresent(inv -> response.setGeneratedInvoiceId(inv.getId()));
            notifyLabReady(saved);
        }
        return response;
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "LabRequest")
    public LabRequestDto saveResult(Long id, String resultPdfUrl) {
        LabRequest r = find(id);
        if (resultPdfUrl != null && !resultPdfUrl.isBlank()) r.setResultPdfUrl(resultPdfUrl);
        LabRequest saved = repository.save(r);
        if (saved.getStatus() == LabStatus.COMPLETED) notifyLabReady(saved);
        return toResponse(saved);
    }

    private void notifyLabReady(LabRequest r) {
        String patientName = patientRepository.findById(r.getPatientId())
            .map(p -> p.getFirstName() + " " + p.getLastName()).orElse("");
        notificationService.notifyStaff(NotificationType.LAB_RESULT_READY,
            "NOTIFICATIONS.LAB_READY_TITLE", "NOTIFICATIONS.LAB_READY_BODY",
            Map.of("requestNo", r.getRequestNo(), "testType", r.getTestType(), "patientName", patientName),
            "LabRequest", r.getId(), null);
        patientRepository.findById(r.getPatientId()).ifPresent(p -> notifyPatientLabReady(p, r));
    }

    private void notifyPatientLabReady(Patient patient, LabRequest r) {
        String subject = "Lab result ready — " + r.getRequestNo();
        String body = String.format(
            "Dear %s %s,%n%nYour lab result for %s (request %s) is ready.%nPlease contact the clinic to collect your results.%n%n— Clinic Management",
            patient.getFirstName(), patient.getLastName(), r.getTestType(), r.getRequestNo());
        if (patient.getEmail() != null && !patient.getEmail().isBlank()) {
            emailService.sendOptional(patient.getEmail(), subject, body);
        }
        if (patient.getPhone() != null && !patient.getPhone().isBlank() && smsService.isEnabled()) {
            smsService.sendOptional(patient.getPhone(),
                String.format("Lab result ready: %s (%s). Please contact the clinic.", r.getTestType(), r.getRequestNo()));
        }
    }

    private void validateTransition(LabStatus from, LabStatus to) {
        if (from == to) return;
        if (from == LabStatus.COMPLETED || from == LabStatus.CANCELLED) {
            throw AppException.badRequest("Invalid status transition", "INVALID_STATUS_TRANSITION");
        }
        if (to == LabStatus.CANCELLED) return;
        boolean valid = switch (from) {
            case REQUESTED -> to == LabStatus.SAMPLE_COLLECTED;
            case SAMPLE_COLLECTED -> to == LabStatus.IN_PROGRESS;
            case IN_PROGRESS -> to == LabStatus.COMPLETED;
            default -> false;
        };
        if (!valid) throw AppException.badRequest("Invalid status transition", "INVALID_STATUS_TRANSITION");
    }

    private LabRequest find(Long id) { return repository.findById(id).orElseThrow(() -> AppException.notFound("Lab request not found")); }

    public LabRequestDto toResponse(LabRequest r) {
        return LabRequestDto.builder().id(r.getId()).requestNo(r.getRequestNo()).patientId(r.getPatientId())
            .doctorId(r.getDoctorId()).consultationId(r.getConsultationId()).testType(r.getTestType()).testCategory(r.getTestCategory())
            .status(r.getStatus()).resultPdfUrl(r.getResultPdfUrl()).notes(r.getNotes())
            .requestedAt(r.getRequestedAt()).completedAt(r.getCompletedAt()).build();
    }

    private static String trim(String q) { return SearchQueryUtil.normalize(q); }
}
