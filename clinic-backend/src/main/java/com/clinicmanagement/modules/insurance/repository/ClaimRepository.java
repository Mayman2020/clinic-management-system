package com.clinicmanagement.modules.insurance.repository;
import com.clinicmanagement.modules.insurance.entity.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    @Query("SELECT c FROM Claim c WHERE (:status IS NULL OR c.status = :status) AND (:q = '' OR LOWER(c.claimNo) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Claim> search(@Param("q") String q, @Param("status") String status, Pageable pageable);
    List<Claim> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    @Query("SELECT c.status, COUNT(c) FROM Claim c GROUP BY c.status")
    List<Object[]> countByStatus();
    @Query("SELECT c.status, COUNT(c) FROM Claim c WHERE c.createdAt >= :from GROUP BY c.status")
    List<Object[]> countByStatusSince(@Param("from") java.time.LocalDateTime from);
}
