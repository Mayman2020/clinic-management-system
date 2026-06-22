package com.clinicmanagement.shared.security;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;
    private record AttemptRecord(int count, LocalDateTime lockedUntil) {}
    private final ConcurrentHashMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();
    public void recordSuccess(String key) { attempts.remove(key.toLowerCase()); }
    public void recordFailure(String key) {
        String k = key.toLowerCase();
        AttemptRecord current = attempts.getOrDefault(k, new AttemptRecord(0, null));
        int newCount = current.count() + 1;
        attempts.put(k, new AttemptRecord(newCount, newCount >= MAX_ATTEMPTS ? LocalDateTime.now().plusMinutes(LOCK_MINUTES) : null));
    }
    public boolean isLocked(String key) {
        AttemptRecord record = attempts.get(key.toLowerCase());
        if (record == null || record.lockedUntil() == null) return false;
        if (LocalDateTime.now().isAfter(record.lockedUntil())) { attempts.remove(key.toLowerCase()); return false; }
        return true;
    }
}
