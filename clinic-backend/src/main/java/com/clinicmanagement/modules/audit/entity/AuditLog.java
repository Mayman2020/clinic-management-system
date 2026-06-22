package com.clinicmanagement.modules.audit.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id") private Long userId;
    @Column(nullable = false, length = 100) private String action;
    @Column(name = "entity_type", length = 100) private String entityType;
    @Column(name = "entity_id") private Long entityId;
    @Column(columnDefinition = "TEXT") private String details;
    @Column(name = "ip_address", length = 45) private String ipAddress;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
