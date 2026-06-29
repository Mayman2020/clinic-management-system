package com.clinicmanagement.modules.notification.service;

import com.clinicmanagement.modules.appointments.dto.AppointmentResponse;
import com.clinicmanagement.modules.appointments.dto.SendReminderResponse;
import com.clinicmanagement.modules.appointments.entity.Appointment;
import com.clinicmanagement.modules.appointments.entity.AppointmentStatus;
import com.clinicmanagement.modules.appointments.repository.AppointmentRepository;
import com.clinicmanagement.modules.doctors.repository.DoctorRepository;
import com.clinicmanagement.modules.notification.entity.NotificationType;
import com.clinicmanagement.modules.notification.repository.NotificationRepository;
import com.clinicmanagement.modules.patients.entity.Patient;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.shared.branch.BranchContextService;
import com.clinicmanagement.shared.exception.AppException;
import com.clinicmanagement.shared.mail.EmailService;
import com.clinicmanagement.shared.sms.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class AppointmentReminderService {
    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final BranchContextService branchContext;

    @Transactional
    public SendReminderResponse sendManualReminder(Long appointmentId, Long actorId) {
        Appointment appointment = findInBranch(appointmentId);
        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            throw AppException.badRequest("Cannot remind cancelled or no-show appointment", "APPOINTMENT_CANNOT_REMIND");
        }
        return dispatchReminder(appointment, actorId, true);
    }

    @Transactional
    public int sendScheduledReminders(java.time.LocalDate targetDate) {
        List<Appointment> appointments = appointmentRepository
            .findByActiveTrueAndAppointmentDateAndStatusIn(targetDate,
                List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED));
        int sent = 0;
        for (Appointment a : appointments) {
            if (notificationRepository.existsByTypeAndReferenceId(NotificationType.APPOINTMENT_REMINDER, a.getId())) {
                continue;
            }
            dispatchReminder(a, null, false);
            sent++;
        }
        return sent;
    }

    private SendReminderResponse dispatchReminder(Appointment appointment, Long actorId, boolean manual) {
        AppointmentResponse response = toResponse(appointment);
        Map<String, Object> vars = Map.of(
            "appointmentNo", response.getAppointmentNo() != null ? response.getAppointmentNo() : "",
            "patientName", response.getPatientName() != null ? response.getPatientName() : "",
            "doctorName", response.getDoctorName() != null ? response.getDoctorName() : "",
            "appointmentDate", String.valueOf(appointment.getAppointmentDate()),
            "startTime", String.valueOf(appointment.getStartTime()));
        notificationService.notifyStaff(NotificationType.APPOINTMENT_REMINDER,
            "NOTIFICATIONS.APPT_REMINDER_TITLE", "NOTIFICATIONS.APPT_REMINDER_BODY",
            vars, "Appointment", appointment.getId(), actorId);

        Patient patient = patientRepository.findById(appointment.getPatientId()).orElse(null);
        boolean emailSent = false;
        boolean smsSent = false;
        if (patient != null) {
            emailSent = sendPatientEmail(patient, response);
            smsSent = sendPatientSms(patient, response);
        }
        return SendReminderResponse.builder()
            .appointmentId(appointment.getId())
            .staffNotified(true)
            .emailSent(emailSent)
            .smsSent(smsSent)
            .message(manual ? "Reminder sent" : "Scheduled reminder sent")
            .build();
    }

    private boolean sendPatientEmail(Patient patient, AppointmentResponse appt) {
        if (patient.getEmail() == null || patient.getEmail().isBlank()) return false;
        String subject = "Appointment reminder — " + appt.getAppointmentNo();
        String body = String.format(
            "Dear %s %s,%n%nThis is a reminder for your appointment on %s at %s with Dr. %s.%n%n— Clinic Management",
            patient.getFirstName(), patient.getLastName(),
            appt.getAppointmentDate(), appt.getStartTime(), appt.getDoctorName());
        emailService.sendOptional(patient.getEmail(), subject, body);
        return true;
    }

    private boolean sendPatientSms(Patient patient, AppointmentResponse appt) {
        if (patient.getPhone() == null || patient.getPhone().isBlank() || !smsService.isEnabled()) return false;
        String body = String.format("Reminder: appointment %s on %s at %s with Dr. %s.",
            appt.getAppointmentNo(), appt.getAppointmentDate(), appt.getStartTime(), appt.getDoctorName());
        smsService.sendOptional(patient.getPhone(), body);
        return true;
    }

    private Appointment findInBranch(Long id) {
        Appointment a = appointmentRepository.findById(id).orElseThrow(() -> AppException.notFound("Appointment not found"));
        Long branchId = branchContext.getFilterBranchId();
        if (branchId != null && a.getBranchId() != null && !branchId.equals(a.getBranchId())) {
            throw AppException.notFound("Appointment not found");
        }
        return a;
    }

    private AppointmentResponse toResponse(Appointment a) {
        String patientName = patientRepository.findById(a.getPatientId())
            .map(p -> p.getFirstName() + " " + p.getLastName()).orElse(null);
        String doctorName = doctorRepository.findById(a.getDoctorId())
            .map(d -> d.getFirstName() + " " + d.getLastName()).orElse(null);
        return AppointmentResponse.builder().id(a.getId()).appointmentNo(a.getAppointmentNo())
            .patientId(a.getPatientId()).doctorId(a.getDoctorId())
            .patientName(patientName).doctorName(doctorName)
            .appointmentDate(a.getAppointmentDate())
            .startTime(a.getStartTime()).endTime(a.getEndTime()).status(a.getStatus())
            .appointmentType(a.getAppointmentType()).notes(a.getNotes()).active(a.isActive())
            .createdAt(a.getCreatedAt()).build();
    }
}
