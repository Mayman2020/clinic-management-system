package com.clinicmanagement.shared.security;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

@Slf4j @Service @RequiredArgsConstructor
public class TokenBlacklistService {
    private final RevokedTokenRepository repository;
    @Transactional
    public void revoke(String token, Instant expiry) {
        if (token == null || token.isBlank() || expiry == null) return;
        String hash = sha256(token);
        if (!repository.existsByTokenHash(hash)) {
            repository.save(RevokedTokenEntity.builder().tokenHash(hash).expiresAt(expiry).createdAt(Instant.now()).build());
        }
    }
    @Transactional(readOnly = true)
    public boolean isRevoked(String token) {
        if (token == null || token.isBlank()) return false;
        return repository.findByTokenHash(sha256(token)).map(r -> Instant.now().isBefore(r.getExpiresAt())).orElse(false);
    }
    @Scheduled(fixedDelay = 3_600_000) @Transactional
    public void purgeExpiredTokens() {
        int deleted = repository.deleteExpired(Instant.now());
        if (deleted > 0) log.debug("Purged {} expired revoked token records", deleted);
    }
    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException("SHA-256 unavailable", e); }
    }
}
