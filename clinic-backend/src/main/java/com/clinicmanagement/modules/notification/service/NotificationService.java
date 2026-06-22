package com.clinicmanagement.modules.notification.service;
import com.clinicmanagement.modules.notification.dto.NotificationResponse;
import com.clinicmanagement.modules.notification.entity.Notification;
import com.clinicmanagement.modules.notification.entity.NotificationType;
import com.clinicmanagement.modules.notification.repository.NotificationRepository;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.modules.user.entity.UserRole;
import com.clinicmanagement.modules.user.repository.UserRepository;
import com.clinicmanagement.shared.exception.AppException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyStaff(NotificationType type, String titleKey, String bodyKey, Map<String, Object> vars,
                            String referenceType, Long referenceId, Long actorUserId) {
        List<Long> recipients = userRepository.findByActiveTrueAndRoleIn(
            List.of(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE))
            .stream().map(User::getId).toList();
        createForRecipients(recipients, actorUserId, type, titleKey, bodyKey, vars, referenceType, referenceId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createForRecipients(Collection<Long> recipientIds, Long actorUserId, NotificationType type,
                                    String titleKey, String bodyKey, Map<String, Object> vars,
                                    String referenceType, Long referenceId) {
        String varsJson = toJson(vars);
        recipientIds.stream().distinct().forEach(rid -> repository.save(Notification.builder()
            .recipientUserId(rid).actorUserId(actorUserId).type(type)
            .titleKey(titleKey).bodyKey(bodyKey).varsJson(varsJson)
            .referenceType(referenceType).referenceId(referenceId).build()));
    }

    public Page<NotificationResponse> getMy(Pageable pageable) {
        return repository.findByRecipientUserIdOrderByCreatedAtDesc(currentUserId(), pageable).map(this::toResponse);
    }

    public long getUnreadCount() {
        return repository.countByRecipientUserIdAndReadAtIsNull(currentUserId());
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification n = repository.findByIdAndRecipientUserId(id, currentUserId())
            .orElseThrow(() -> AppException.notFound("Notification not found"));
        if (n.getReadAt() == null) n.setReadAt(LocalDateTime.now());
        return toResponse(repository.save(n));
    }

    @Transactional
    public void markAllRead() {
        repository.markAllRead(currentUserId(), LocalDateTime.now());
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder().id(n.getId()).type(n.getType())
            .titleKey(n.getTitleKey()).bodyKey(n.getBodyKey()).varsJson(n.getVarsJson())
            .referenceType(n.getReferenceType()).referenceId(n.getReferenceId())
            .read(n.getReadAt() != null).readAt(n.getReadAt()).createdAt(n.getCreatedAt()).build();
    }

    private String toJson(Map<String, Object> vars) {
        if (vars == null || vars.isEmpty()) return null;
        try { return objectMapper.writeValueAsString(vars); } catch (JsonProcessingException e) { return null; }
    }

    private Long currentUserId() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (p instanceof User u) return u.getId();
        throw AppException.forbidden("Authentication required");
    }
}
