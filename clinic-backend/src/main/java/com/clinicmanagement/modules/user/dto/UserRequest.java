package com.clinicmanagement.modules.user.dto;
import com.clinicmanagement.modules.user.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank private String username;
    @NotBlank @Email private String email;
    private String password;
    private String fullName;
    private String phone;
    @NotNull private UserRole role;
    private String extraRoles;
    private Boolean active;
    private Boolean mustChangePassword;
}
