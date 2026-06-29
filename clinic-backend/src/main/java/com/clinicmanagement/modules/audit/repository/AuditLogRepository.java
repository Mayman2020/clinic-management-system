package com.clinicmanagement.modules.audit.repository;
import com.clinicmanagement.modules.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:q = '' OR LOWER(a.action) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(a.details) LIKE LOWER(CONCAT('%', :q, '%'))
                OR CAST(a.entityId AS string) LIKE CONCAT('%', :q, '%'))
            ORDER BY a.createdAt DESC
            """)
    Page<AuditLog> search(@Param("q") String q, Pageable pageable);
}
