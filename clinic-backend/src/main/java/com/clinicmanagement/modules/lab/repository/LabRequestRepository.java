package com.clinicmanagement.modules.lab.repository;
import com.clinicmanagement.modules.lab.entity.LabRequest;
import com.clinicmanagement.modules.lab.entity.LabStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LabRequestRepository extends JpaRepository<LabRequest, Long> {
    @Query("SELECT r FROM LabRequest r WHERE (:status IS NULL OR r.status = :status) AND (:q IS NULL OR LOWER(r.requestNo) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(r.testType) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<LabRequest> search(@Param("q") String q, @Param("status") LabStatus status, Pageable pageable);
    List<LabRequest> findByPatientIdOrderByRequestedAtDesc(Long patientId);
    List<LabRequest> findByStatus(LabStatus status);
}
