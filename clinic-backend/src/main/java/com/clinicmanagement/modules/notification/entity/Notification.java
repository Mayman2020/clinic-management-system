package com.clinicmanagement.modules.notification.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "recipient_user_id", nullable = false) private Long recipientUserId;
    @Column(name = "actor_user_id") private Long actorUserId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 80) private NotificationType type;
    @Column(name = "title_key", nullable = false, length = 200) private String titleKey;
    @Column(name = "body_key", nullable = false, length = 200) private String bodyKey;
    @Column(name = "vars_json", columnDefinition = "TEXT") private String varsJson;
    @Column(name = "reference_type", length = 80) private String referenceType;
    @Column(name = "reference_id") private Long referenceId;
    @Column(name = "read_at") private LocalDateTime readAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
