package com.clinicmanagement.modules.prescription.repository;
import com.clinicmanagement.modules.prescription.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    @Query("SELECT p FROM Prescription p WHERE (:status IS NULL OR p.status = :status) AND (:q IS NULL OR LOWER(p.prescriptionNo) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Prescription> search(@Param("q") String q, @Param("status") String status, Pageable pageable);
    @EntityGraph(attributePaths = "items")
    Optional<Prescription> findWithItemsById(Long id);
}
