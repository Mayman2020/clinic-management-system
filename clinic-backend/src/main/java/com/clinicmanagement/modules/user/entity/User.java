package com.clinicmanagement.modules.user.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name = "users") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true, nullable = false, length = 100) private String username;
    @Column(unique = true, nullable = false, length = 150) private String email;
    @Column(name = "password_hash", nullable = false) private String password;
    @Column(name = "full_name", length = 150) private String fullName;
    @Column(length = 20) private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private UserRole role;
    @Column(name = "extra_roles", length = 500) private String extraRoles;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @Builder.Default @Column(name = "must_change_password") private boolean mustChangePassword = false;
    @Column(name = "last_login") private LocalDateTime lastLogin;
    @Column(name = "last_login_ip", length = 45) private String lastLoginIp;
    @CreatedBy @Column(name = "created_by", updatable = false) private Long createdBy;
    @CreatedDate @Column(name = "created_on", updatable = false) private LocalDateTime createdOn;
    @LastModifiedBy @Column(name = "modified_by") private Long modifiedBy;
    @LastModifiedDate @Column(name = "modified_on") private LocalDateTime modifiedOn;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;

    public List<UserRole> getExtraRolesList() {
        if (extraRoles == null || extraRoles.isBlank()) return List.of();
        List<UserRole> list = new ArrayList<>();
        for (String part : extraRoles.split(",")) {
            if (!part.isBlank()) list.add(UserRole.valueOf(part.trim()));
        }
        return list;
    }
    public List<UserRole> getAllAssignedRoles() {
        LinkedHashSet<UserRole> set = new LinkedHashSet<>();
        if (role != null) set.add(role);
        set.addAll(getExtraRolesList());
        return new ArrayList<>(set);
    }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        LinkedHashSet<SimpleGrantedAuthority> authorities = new LinkedHashSet<>();
        if (role != null) authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        for (UserRole r : getExtraRolesList()) {
            if (r != null && r != role) authorities.add(new SimpleGrantedAuthority("ROLE_" + r.name()));
        }
        return new ArrayList<>(authorities);
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }
}
