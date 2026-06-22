package com.clinicmanagement.shared.security;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "revoked_tokens") @Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class RevokedTokenEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64) private String tokenHash;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(name = "created_at") private Instant createdAt;
}
