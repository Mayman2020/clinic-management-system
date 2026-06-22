package com.clinicmanagement.modules.doctors.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class DoctorScheduleRequest {
    @NotNull private Short dayOfWeek;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
    private Boolean active;
}
