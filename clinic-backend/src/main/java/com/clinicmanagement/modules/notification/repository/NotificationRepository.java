package com.clinicmanagement.modules.notification.repository;
import com.clinicmanagement.modules.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId, Pageable pageable);
    long countByRecipientUserIdAndReadAtIsNull(Long recipientUserId);
    java.util.Optional<Notification> findByIdAndRecipientUserId(Long id, Long recipientUserId);
    @Modifying @Query("UPDATE Notification n SET n.readAt = :readAt WHERE n.recipientUserId = :userId AND n.readAt IS NULL")
    void markAllRead(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
}
