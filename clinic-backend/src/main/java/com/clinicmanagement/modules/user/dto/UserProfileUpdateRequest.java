package com.clinicmanagement.modules.user.dto;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String email;
}
