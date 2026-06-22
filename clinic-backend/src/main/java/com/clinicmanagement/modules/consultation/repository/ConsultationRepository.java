package com.clinicmanagement.modules.consultation.repository;
import com.clinicmanagement.modules.consultation.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    @Query("SELECT c FROM Consultation c WHERE (:q IS NULL OR LOWER(COALESCE(c.diagnosis,'')) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(COALESCE(c.symptoms,'')) LIKE LOWER(CONCAT('%',:q,'%'))) ORDER BY c.createdAt DESC")
    Page<Consultation> search(@Param("q") String q, Pageable pageable);
}
