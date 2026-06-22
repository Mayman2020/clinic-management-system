package com.clinicmanagement.modules.audit.aspect;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.audit.service.AuditLogService;
import com.clinicmanagement.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.lang.reflect.Method;

@Slf4j @Aspect @Component @RequiredArgsConstructor
public class AuditAspect {
    private final AuditLogService auditLogService;

    @Around("@annotation(auditable)")
    public Object logAudit(ProceedingJoinPoint pjp, Auditable auditable) throws Throwable {
        Object result = pjp.proceed();
        try {
            Long userId = currentUserId();
            Long entityId = extractEntityId(result, pjp.getArgs());
            String details = pjp.getSignature().toShortString();
            auditLogService.log(userId, auditable.action(), auditable.entityType(), entityId, details, null);
        } catch (Exception ex) {
            log.warn("Failed to write audit log for {}: {}", auditable.entityType(), ex.getMessage());
        }
        return result;
    }

    private Long currentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User u) return u.getId();
        return null;
    }

    private Long extractEntityId(Object result, Object[] args) {
        Long fromResult = idFromObject(result);
        if (fromResult != null) return fromResult;
        for (Object arg : args) {
            Long id = idFromObject(arg);
            if (id != null) return id;
        }
        return null;
    }

    private Long idFromObject(Object obj) {
        if (obj == null) return null;
        try {
            Method m = obj.getClass().getMethod("getId");
            Object id = m.invoke(obj);
            if (id instanceof Long l) return l;
        } catch (ReflectiveOperationException ignored) { }
        if (obj instanceof Long l) return l;
        return null;
    }
}
