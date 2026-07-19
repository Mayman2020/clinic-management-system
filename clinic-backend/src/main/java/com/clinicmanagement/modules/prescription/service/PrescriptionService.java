package com.clinicmanagement.modules.prescription.service;
import com.clinicmanagement.shared.util.SearchQueryUtil;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.prescription.dto.*;
import com.clinicmanagement.modules.prescription.entity.*;
import com.clinicmanagement.modules.prescription.repository.PrescriptionRepository;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.doctors.repository.DoctorRepository;
import com.clinicmanagement.modules.settings.service.SettingsService;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service @RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository repository;
    private final SettingsService settingsService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public Page<PrescriptionResponse> list(Pageable pageable, String q, String status) {
        return repository.search(trim(q), blankToNull(status), pageable).map(this::toResponse);
    }

    public PrescriptionResponse getById(Long id) {
        return toResponse(repository.findWithItemsById(id).orElseThrow(() -> AppException.notFound("Prescription not found")));
    }

    public List<PrescriptionResponse> listByPatient(Long patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::toResponse).toList();
    }

    public PrescriptionPrintData getPrintData(Long id) {
        PrescriptionResponse r = getById(id);
        String patientName = patientRepository.findById(r.getPatientId())
            .map(p -> p.getFirstName() + " " + p.getLastName()).orElse(null);
        String doctorName = doctorRepository.findById(r.getDoctorId())
            .map(d -> d.getFirstName() + " " + d.getLastName()).orElse(null);
        return PrescriptionPrintData.builder().prescriptionNo(r.getPrescriptionNo())
            .patientId(r.getPatientId()).patientName(patientName)
            .doctorId(r.getDoctorId()).doctorName(doctorName)
            .notes(r.getNotes()).issuedAt(r.getCreatedAt()).items(r.getItems())
            .clinicName(settingsService.resolveValue("clinic_name", "Clinic Management System")).build();
    }

    @Transactional @Auditable(action = "CREATE", entityType = "Prescription")
    public PrescriptionResponse create(PrescriptionRequest request) {
        Prescription p = Prescription.builder().prescriptionNo("RX-" + String.format("%06d", repository.count() + 1))
            .consultationId(request.getConsultationId()).patientId(request.getPatientId())
            .doctorId(request.getDoctorId()).notes(request.getNotes()).status("ACTIVE").build();
        for (PrescriptionItemRequest ir : request.getItems()) {
            PrescriptionItem item = PrescriptionItem.builder().prescription(p).medicineName(ir.getMedicineName())
                .dosage(ir.getDosage()).frequency(ir.getFrequency()).duration(ir.getDuration()).notes(ir.getNotes()).build();
            p.getItems().add(item);
        }
        return toResponse(repository.save(p));
    }

    public PrescriptionResponse toResponse(Prescription p) {
        String patientName = patientRepository.findById(p.getPatientId())
            .map(pt -> pt.getFirstName() + " " + pt.getLastName()).orElse(null);
        String doctorName = doctorRepository.findById(p.getDoctorId())
            .map(d -> d.getFirstName() + " " + d.getLastName()).orElse(null);
        return PrescriptionResponse.builder().id(p.getId()).prescriptionNo(p.getPrescriptionNo())
            .consultationId(p.getConsultationId()).patientId(p.getPatientId()).patientName(patientName)
            .doctorId(p.getDoctorId()).doctorName(doctorName)
            .notes(p.getNotes()).status(p.getStatus()).createdAt(p.getCreatedAt())
            .items(p.getItems().stream().map(i -> PrescriptionItemResponse.builder().id(i.getId())
                .medicineName(i.getMedicineName()).dosage(i.getDosage()).frequency(i.getFrequency())
                .duration(i.getDuration()).notes(i.getNotes()).build()).toList()).build();
    }

    private static String trim(String q) { return SearchQueryUtil.normalize(q); }
    private static String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }
}
