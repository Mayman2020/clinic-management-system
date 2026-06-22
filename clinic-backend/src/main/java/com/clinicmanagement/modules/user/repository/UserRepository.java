package com.clinicmanagement.modules.user.repository;
import com.clinicmanagement.modules.user.entity.User;
import com.clinicmanagement.modules.user.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    @Query("SELECT u FROM User u WHERE (:q IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%',:q,'%'))) AND (:role IS NULL OR u.role = :role)")
    Page<User> search(@Param("q") String q, @Param("role") UserRole role, Pageable pageable);
    java.util.List<User> findByActiveTrueAndRoleIn(java.util.Collection<UserRole> roles);
}
