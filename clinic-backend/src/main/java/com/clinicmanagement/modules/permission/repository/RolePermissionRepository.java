package com.clinicmanagement.modules.permission.repository;
import com.clinicmanagement.modules.permission.entity.RolePermissionEntity;
import com.clinicmanagement.modules.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermissionEntity, UserRole> {}
