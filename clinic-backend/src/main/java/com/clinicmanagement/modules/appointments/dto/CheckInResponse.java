package com.clinicmanagement.modules.appointments.dto;
import com.clinicmanagement.modules.queue.dto.QueueTokenResponse;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class CheckInResponse {
    private AppointmentResponse appointment;
    private QueueTokenResponse queueToken;
}
