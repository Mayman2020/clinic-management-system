package com.clinicmanagement.modules.doctors.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;

@Data @Builder
public class DoctorScheduleResponse {
    private Long id;
    private Long doctorId;
    private Short dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;
}
