package com.clinicmanagement.modules.billing.repository;
import com.clinicmanagement.modules.billing.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceIdOrderByPaidAtDesc(Long invoiceId);

    @Query("SELECT p FROM Payment p JOIN p.invoice i WHERE (:branchId IS NULL OR i.branchId = :branchId) ORDER BY p.paidAt DESC")
    Page<Payment> findAllOrdered(@Param("branchId") Long branchId, Pageable pageable);

    @Query("""
        SELECT p FROM Payment p JOIN p.invoice i
        WHERE (:branchId IS NULL OR i.branchId = :branchId)
        AND (:q = '' OR LOWER(COALESCE(p.paymentMethod, '')) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(COALESCE(p.referenceNo, '')) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(COALESCE(p.notes, '')) LIKE LOWER(CONCAT('%', :q, '%')))
        ORDER BY p.paidAt DESC
        """)
    Page<Payment> search(@Param("q") String q, @Param("branchId") Long branchId, Pageable pageable);
}
