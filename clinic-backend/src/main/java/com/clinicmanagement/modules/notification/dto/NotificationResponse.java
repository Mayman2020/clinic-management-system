package com.clinicmanagement.modules.notification.dto;
import com.clinicmanagement.modules.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String titleKey;
    private String bodyKey;
    private String varsJson;
    private String referenceType;
    private Long referenceId;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
