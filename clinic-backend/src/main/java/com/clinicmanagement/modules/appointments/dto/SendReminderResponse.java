package com.clinicmanagement.modules.appointments.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class SendReminderResponse {
    private Long appointmentId;
    private boolean staffNotified;
    private boolean emailSent;
    private boolean smsSent;
    private String message;
}
