package com.clinicmanagement.modules.permission.entity;
import com.clinicmanagement.modules.user.entity.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity @Table(name = "role_permissions") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionEntity {
    @Id @Enumerated(EnumType.STRING) @Column(length = 30) private UserRole role;
    @Column(name = "permissions_json", nullable = false, columnDefinition = "TEXT") private String permissionsJson;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
