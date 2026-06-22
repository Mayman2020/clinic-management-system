package com.clinicmanagement.modules.radiology.service;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.radiology.dto.RadiologyRequestDto;
import com.clinicmanagement.modules.radiology.entity.*;
import com.clinicmanagement.modules.radiology.repository.RadiologyRequestRepository;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class RadiologyService {
    private final RadiologyRequestRepository repository;

    public Page<RadiologyRequestDto> list(Pageable pageable, RadiologyStatus status, String q) {
        return repository.search(trim(q), status, pageable).map(this::toResponse);
    }

    public RadiologyRequestDto getById(Long id) { return toResponse(find(id)); }
    public List<RadiologyRequestDto> byPatient(Long patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::toResponse).toList();
    }

    @Transactional @Auditable(action = "CREATE", entityType = "RadiologyRequest")
    public RadiologyRequestDto create(RadiologyRequestDto dto) {
        RadiologyRequest r = RadiologyRequest.builder().requestNo("RAD-" + String.format("%06d", repository.count() + 1))
            .patientId(dto.getPatientId()).doctorId(dto.getDoctorId()).studyType(dto.getStudyType())
            .status(RadiologyStatus.REQUESTED).notes(dto.getNotes()).build();
        return toResponse(repository.save(r));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "RadiologyRequest")
    public RadiologyRequestDto updateStatus(Long id, RadiologyStatus status, String reportText, String imageUrl, LocalDateTime scheduledAt) {
        RadiologyRequest r = find(id);
        validateTransition(r.getStatus(), status);
        if (status == RadiologyStatus.SCHEDULED && scheduledAt == null && r.getScheduledAt() == null) {
            throw AppException.badRequest("Scheduled date/time is required when status is SCHEDULED", "SCHEDULED_AT_REQUIRED");
        }
        r.setStatus(status);
        if (scheduledAt != null) r.setScheduledAt(scheduledAt);
        if (reportText != null) r.setReportText(reportText);
        if (imageUrl != null) r.setImageUrl(imageUrl);
        if (status == RadiologyStatus.COMPLETED) r.setCompletedAt(LocalDateTime.now());
        return toResponse(repository.save(r));
    }

    private void validateTransition(RadiologyStatus from, RadiologyStatus to) {
        if (from == to) return;
        if (from == RadiologyStatus.COMPLETED || from == RadiologyStatus.CANCELLED) {
            throw AppException.badRequest("Invalid status transition", "INVALID_STATUS_TRANSITION");
        }
        if (to == RadiologyStatus.CANCELLED) return;
        boolean valid = switch (from) {
            case REQUESTED -> to == RadiologyStatus.SCHEDULED;
            case SCHEDULED -> to == RadiologyStatus.IN_PROGRESS;
            case IN_PROGRESS -> to == RadiologyStatus.COMPLETED;
            default -> false;
        };
        if (!valid) throw AppException.badRequest("Invalid status transition", "INVALID_STATUS_TRANSITION");
    }

    private RadiologyRequest find(Long id) { return repository.findById(id).orElseThrow(() -> AppException.notFound("Radiology request not found")); }

    public RadiologyRequestDto toResponse(RadiologyRequest r) {
        return RadiologyRequestDto.builder().id(r.getId()).requestNo(r.getRequestNo()).patientId(r.getPatientId())
            .doctorId(r.getDoctorId()).studyType(r.getStudyType()).status(r.getStatus())
            .scheduledAt(r.getScheduledAt()).reportText(r.getReportText()).imageUrl(r.getImageUrl())
            .notes(r.getNotes()).completedAt(r.getCompletedAt()).build();
    }

    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }
}
