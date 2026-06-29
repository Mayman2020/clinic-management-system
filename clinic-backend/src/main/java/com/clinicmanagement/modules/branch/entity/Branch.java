package com.clinicmanagement.modules.branch.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "branches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Branch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "branch_code", unique = true, nullable = false, length = 30) private String branchCode;
    @Column(nullable = false, length = 150) private String name;
    @Column(columnDefinition = "TEXT") private String address;
    @Column(length = 30) private String phone;
    @Column(length = 150) private String email;
    @Builder.Default @Column(name = "is_default") private boolean defaultBranch = false;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
