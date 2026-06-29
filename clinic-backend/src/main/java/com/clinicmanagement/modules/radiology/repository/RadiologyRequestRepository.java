package com.clinicmanagement.modules.radiology.repository;
import com.clinicmanagement.modules.radiology.entity.RadiologyRequest;
import com.clinicmanagement.modules.radiology.entity.RadiologyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RadiologyRequestRepository extends JpaRepository<RadiologyRequest, Long> {
    @Query("SELECT r FROM RadiologyRequest r WHERE (:status IS NULL OR r.status = :status) AND (:q = '' OR LOWER(r.requestNo) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(r.studyType) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<RadiologyRequest> search(@Param("q") String q, @Param("status") RadiologyStatus status, Pageable pageable);
    List<RadiologyRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<RadiologyRequest> findByConsultationId(Long consultationId);
    List<RadiologyRequest> findByStatus(RadiologyStatus status);
}
