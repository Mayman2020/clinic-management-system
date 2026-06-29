package com.clinicmanagement.modules.notification.scheduler;

import com.clinicmanagement.modules.notification.service.AppointmentReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component @RequiredArgsConstructor @Slf4j
public class AppointmentReminderScheduler {
    private final AppointmentReminderService appointmentReminderService;

    @Scheduled(cron = "${clinic.reminders.cron:0 0 8 * * *}")
    public void sendTomorrowReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        int sent = appointmentReminderService.sendScheduledReminders(tomorrow);
        if (sent > 0) log.info("Sent {} appointment reminder(s) for {}", sent, tomorrow);
    }
}
