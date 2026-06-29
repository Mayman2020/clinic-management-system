package com.clinicmanagement.modules.billing.repository;
import com.clinicmanagement.modules.billing.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    boolean existsByItemTypeAndReferenceId(String itemType, Long referenceId);
    Optional<InvoiceItem> findByItemTypeAndReferenceId(String itemType, Long referenceId);
}
