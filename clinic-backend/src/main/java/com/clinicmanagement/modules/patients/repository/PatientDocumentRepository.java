package com.clinicmanagement.modules.patients.repository;
import com.clinicmanagement.modules.patients.entity.PatientDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientDocumentRepository extends JpaRepository<PatientDocument, Long> {
    List<PatientDocument> findByPatientIdOrderByUploadedAtDesc(Long patientId);
}
