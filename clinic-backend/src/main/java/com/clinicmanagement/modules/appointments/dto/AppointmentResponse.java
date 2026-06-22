package com.clinicmanagement.modules.appointments.dto;
import com.clinicmanagement.modules.appointments.entity.AppointmentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder
public class AppointmentResponse {
    private Long id;
    private String appointmentNo;
    private Long patientId;
    private Long doctorId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String appointmentType;
    private String notes;
    private boolean active;
    private LocalDateTime createdAt;
    private String patientName;
    private String doctorName;
}
