package com.clinicmanagement.modules.doctors.dto;
import com.clinicmanagement.modules.doctors.entity.Specialty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DoctorRequest {
    private Long userId;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotNull private Specialty specialty;
    private String department;
    private String phone;
    private String email;
    private BigDecimal consultationFee;
    private String bio;
    private Boolean active;
}
