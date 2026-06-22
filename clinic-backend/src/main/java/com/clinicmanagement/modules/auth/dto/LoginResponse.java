package com.clinicmanagement.modules.auth.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserDto user;

    @Data @Builder
    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String phone;
        private String role;
        private List<String> extraRoles;
        private Map<String, Map<String, Boolean>> permissions;
        private boolean mustChangePassword;
    }
}
