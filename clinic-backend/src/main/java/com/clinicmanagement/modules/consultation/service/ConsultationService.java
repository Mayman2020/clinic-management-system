package com.clinicmanagement.modules.consultation.service;
import com.clinicmanagement.modules.consultation.dto.*;
import com.clinicmanagement.modules.consultation.entity.Consultation;
import com.clinicmanagement.modules.consultation.repository.ConsultationRepository;
import com.clinicmanagement.modules.doctors.repository.DoctorRepository;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class ConsultationService {
    private final ConsultationRepository repository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public Page<ConsultationResponse> list(Pageable pageable, String q) {
        return repository.search(trim(q), pageable).map(this::toResponse);
    }

    public ConsultationResponse getById(Long id) { return toResponse(find(id)); }
    public List<ConsultationResponse> byPatient(Long patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ConsultationResponse create(ConsultationRequest request) {
        Consultation c = Consultation.builder().appointmentId(request.getAppointmentId())
            .patientId(request.getPatientId()).doctorId(request.getDoctorId())
            .symptoms(request.getSymptoms()).diagnosis(request.getDiagnosis()).notes(request.getNotes())
            .treatmentPlan(request.getTreatmentPlan()).followUpDate(request.getFollowUpDate())
            .status(request.getStatus() != null ? request.getStatus() : "IN_PROGRESS").build();
        return toResponse(repository.save(c));
    }

    @Transactional
    public ConsultationResponse update(Long id, ConsultationRequest request) {
        Consultation c = find(id);
        c.setSymptoms(request.getSymptoms()); c.setDiagnosis(request.getDiagnosis());
        c.setNotes(request.getNotes()); c.setTreatmentPlan(request.getTreatmentPlan());
        c.setFollowUpDate(request.getFollowUpDate());
        if (request.getStatus() != null) c.setStatus(request.getStatus());
        return toResponse(repository.save(c));
    }

    private Consultation find(Long id) { return repository.findById(id).orElseThrow(() -> AppException.notFound("Consultation not found")); }
    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }

    public ConsultationResponse toResponse(Consultation c) {
        String patientName = patientRepository.findById(c.getPatientId())
            .map(p -> p.getFirstName() + " " + p.getLastName()).orElse(null);
        String doctorName = doctorRepository.findById(c.getDoctorId())
            .map(d -> d.getFirstName() + " " + d.getLastName()).orElse(null);
        return ConsultationResponse.builder().id(c.getId()).appointmentId(c.getAppointmentId())
            .patientId(c.getPatientId()).patientName(patientName).doctorId(c.getDoctorId()).doctorName(doctorName)
            .symptoms(c.getSymptoms()).diagnosis(c.getDiagnosis()).notes(c.getNotes()).treatmentPlan(c.getTreatmentPlan())
            .followUpDate(c.getFollowUpDate()).status(c.getStatus()).createdAt(c.getCreatedAt()).build();
    }
}
