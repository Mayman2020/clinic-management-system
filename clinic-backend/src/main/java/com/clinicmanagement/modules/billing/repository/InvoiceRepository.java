package com.clinicmanagement.modules.billing.repository;
import com.clinicmanagement.modules.billing.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    @Query("SELECT i FROM Invoice i WHERE (:branchId IS NULL OR i.branchId = :branchId) AND (:status IS NULL OR i.status = :status) AND (:q = '' OR LOWER(i.invoiceNo) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Invoice> search(@Param("q") String q, @Param("status") String status, @Param("branchId") Long branchId, Pageable pageable);
    Page<Invoice> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
    Page<Invoice> findByPatientIdAndBranchIdOrderByCreatedAtDesc(Long patientId, Long branchId, Pageable pageable);
    @EntityGraph(attributePaths = {"items", "payments"})
    Optional<Invoice> findWithDetailsById(Long id);
    Optional<Invoice> findByConsultationId(Long consultationId);
    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.createdAt BETWEEN :from AND :to")
    BigDecimal sumPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.createdAt BETWEEN :from AND :to AND (:branchId IS NULL OR i.branchId = :branchId)")
    BigDecimal sumPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("branchId") Long branchId);
    @Query("SELECT ii.itemType, SUM(ii.totalPrice) FROM InvoiceItem ii GROUP BY ii.itemType ORDER BY SUM(ii.totalPrice) DESC")
    List<Object[]> topServices();
}
