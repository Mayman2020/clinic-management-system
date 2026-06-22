package com.clinicmanagement.modules.doctors.dto;
import com.clinicmanagement.modules.doctors.entity.Specialty;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class DoctorResponse {
    private Long id;
    private Long userId;
    private String doctorCode;
    private String firstName;
    private String lastName;
    private Specialty specialty;
    private String department;
    private String phone;
    private String email;
    private BigDecimal consultationFee;
    private String bio;
    private boolean active;
    private List<DoctorScheduleResponse> schedules;
    private LocalDateTime createdAt;
}
