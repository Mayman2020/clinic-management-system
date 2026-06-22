package com.clinicmanagement.modules.lab.service;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.lab.dto.LabRequestDto;
import com.clinicmanagement.modules.lab.entity.*;
import com.clinicmanagement.modules.lab.repository.LabRequestRepository;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class LabService {
    private final LabRequestRepository repository;

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
            .patientId(dto.getPatientId()).doctorId(dto.getDoctorId()).testType(dto.getTestType())
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
        return toResponse(repository.save(r));
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
            .doctorId(r.getDoctorId()).testType(r.getTestType()).testCategory(r.getTestCategory())
            .status(r.getStatus()).resultPdfUrl(r.getResultPdfUrl()).notes(r.getNotes())
            .requestedAt(r.getRequestedAt()).completedAt(r.getCompletedAt()).build();
    }

    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }
}
