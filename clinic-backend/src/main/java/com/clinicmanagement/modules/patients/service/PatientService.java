package com.clinicmanagement.modules.patients.service;
import com.clinicmanagement.shared.util.SearchQueryUtil;
import com.clinicmanagement.modules.patients.dto.*;
import com.clinicmanagement.modules.patients.entity.*;
import com.clinicmanagement.modules.patients.mapper.PatientMapper;
import com.clinicmanagement.modules.patients.repository.*;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;
    private final PatientDocumentRepository documentRepository;
    private final PatientMapper mapper;

    public Page<PatientResponse> search(String q, Boolean active, Pageable pageable) {
        return patientRepository.search(trim(q), active, pageable).map(mapper::toResponse);
    }
    public PatientResponse getById(Long id) { return mapper.toResponse(find(id)); }

    @Transactional
    public PatientResponse create(PatientRequest request) {
        checkDuplicateNationalId(request.getNationalId(), null);
        Patient p = Patient.builder().patientCode(generateCode()).active(true).build();
        mapper.apply(request, p);
        return mapper.toResponse(patientRepository.save(p));
    }

    @Transactional
    public PatientResponse update(Long id, PatientRequest request) {
        Patient p = find(id);
        checkDuplicateNationalId(request.getNationalId(), id);
        mapper.apply(request, p);
        return mapper.toResponse(patientRepository.save(p));
    }

    @Transactional
    public void archive(Long id) { Patient p = find(id); p.setActive(false); patientRepository.save(p); }

    @Transactional
    public PatientDocumentResponse addDocument(PatientDocumentRequest request) {
        find(request.getPatientId());
        PatientDocument doc = PatientDocument.builder().patientId(request.getPatientId())
            .fileName(request.getFileName()).fileUrl(request.getFileUrl())
            .documentType(request.getDocumentType()).uploadedAt(LocalDateTime.now()).build();
        return mapper.toResponse(documentRepository.save(doc));
    }

    public java.util.List<PatientDocumentResponse> listDocuments(Long patientId) {
        find(patientId);
        return documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId).stream().map(mapper::toResponse).toList();
    }

    private Patient find(Long id) { return patientRepository.findById(id).orElseThrow(() -> AppException.notFound("Patient not found")); }
    private void checkDuplicateNationalId(String nationalId, Long excludeId) {
        if (nationalId == null || nationalId.isBlank()) return;
        boolean dup = excludeId == null ? patientRepository.existsByNationalIdAndActiveTrue(nationalId.trim())
            : patientRepository.existsByNationalIdAndActiveTrueAndIdNot(nationalId.trim(), excludeId);
        if (dup) throw AppException.conflict("Patient with this national ID already exists", "NATIONAL_ID_ALREADY_USED");
    }
    private static String trim(String q) { return SearchQueryUtil.normalize(q); }
    private String generateCode() { return "PAT-" + String.format("%06d", patientRepository.count() + 1); }
}
