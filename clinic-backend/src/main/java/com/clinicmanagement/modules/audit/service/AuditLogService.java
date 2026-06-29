package com.clinicmanagement.modules.audit.service;
import com.clinicmanagement.modules.audit.entity.AuditLog;
import com.clinicmanagement.modules.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository repository;

    public Page<AuditLog> list(Pageable pageable, String q) {
        String term = q == null ? "" : q.trim();
        if (term.isEmpty()) {
            return repository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return repository.search(term, pageable);
    }

    @Transactional
    public AuditLog log(Long userId, String action, String entityType, Long entityId, String details, String ip) {
        return repository.save(AuditLog.builder().userId(userId).action(action).entityType(entityType)
            .entityId(entityId).details(details).ipAddress(ip).createdAt(java.time.LocalDateTime.now()).build());
    }
}
