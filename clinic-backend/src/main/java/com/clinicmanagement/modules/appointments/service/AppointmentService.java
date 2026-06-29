package com.clinicmanagement.modules.appointments.service;
import com.clinicmanagement.shared.util.SearchQueryUtil;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.appointments.dto.*;
import com.clinicmanagement.modules.appointments.entity.*;
import com.clinicmanagement.modules.appointments.repository.AppointmentRepository;
import com.clinicmanagement.modules.doctors.repository.DoctorRepository;
import com.clinicmanagement.modules.notification.entity.NotificationType;
import com.clinicmanagement.modules.notification.service.NotificationService;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.queue.dto.QueueTokenRequest;
import com.clinicmanagement.modules.queue.dto.QueueTokenResponse;
import com.clinicmanagement.modules.queue.service.QueueService;
import com.clinicmanagement.shared.branch.BranchContextService;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.clinicmanagement.modules.user.entity.User;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository repository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;
    private final QueueService queueService;
    private final BranchContextService branchContext;

    public Page<AppointmentResponse> list(Pageable pageable, String q, AppointmentStatus status, List<AppointmentStatus> statuses, Long doctorId) {
        if (statuses != null && !statuses.isEmpty()) {
            return repository.searchByStatuses(trim(q), statuses, doctorId, branchContext.getFilterBranchId(), pageable).map(this::toResponse);
        }
        return repository.search(trim(q), status, doctorId, branchContext.getFilterBranchId(), pageable).map(this::toResponse);
    }

    public List<AppointmentResponse> calendar(LocalDate from, LocalDate to, Long doctorId, AppointmentStatus status) {
        return repository.findCalendar(from, to, doctorId, status, branchContext.getFilterBranchId()).stream().map(this::toResponse).toList();
    }
    public AppointmentResponse getById(Long id) { return toResponse(find(id)); }

    public List<AppointmentResponse> byPatient(Long patientId) {
        return repository.findByPatientIdAndActiveTrueOrderByAppointmentDateDescStartTimeDesc(patientId)
            .stream().map(this::toResponse).toList();
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "Appointment")
    public CheckInResponse checkIn(Long id) {
        Appointment a = find(id);
        if (a.getStatus() == AppointmentStatus.CANCELLED || a.getStatus() == AppointmentStatus.NO_SHOW) {
            throw AppException.badRequest("Cannot check in a cancelled or no-show appointment", "APPOINTMENT_CANNOT_CHECK_IN");
        }
        a.setStatus(AppointmentStatus.WAITING);
        AppointmentResponse appointment = toResponse(repository.save(a));
        QueueTokenRequest tokenRequest = new QueueTokenRequest();
        tokenRequest.setPatientId(a.getPatientId());
        tokenRequest.setDoctorId(a.getDoctorId());
        tokenRequest.setAppointmentId(a.getId());
        tokenRequest.setQueueDate(LocalDate.now());
        QueueTokenResponse queueToken = queueService.generateToken(tokenRequest);
        return CheckInResponse.builder().appointment(appointment).queueToken(queueToken).build();
    }

    @Transactional @Auditable(action = "CREATE", entityType = "Appointment")
    public AppointmentResponse book(AppointmentRequest request) {
        checkOverlap(request, null);
        return toResponse(repository.save(build(request, AppointmentStatus.SCHEDULED, "SCHEDULED")));
    }

    @Transactional @Auditable(action = "CREATE", entityType = "Appointment")
    public AppointmentResponse walkIn(AppointmentRequest request) {
        checkOverlap(request, null);
        return toResponse(repository.save(build(request, AppointmentStatus.WAITING, "WALK_IN")));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "Appointment")
    public AppointmentResponse reschedule(Long id, AppointmentRequest request) {
        Appointment a = find(id);
        a.setAppointmentDate(request.getAppointmentDate()); a.setStartTime(request.getStartTime());
        a.setEndTime(request.getEndTime()); a.setDoctorId(request.getDoctorId());
        if (request.getNotes() != null) a.setNotes(request.getNotes());
        checkOverlap(request, id);
        return toResponse(repository.save(a));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "Appointment")
    public AppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        Appointment a = find(id);
        if (a.getStatus() == AppointmentStatus.COMPLETED) {
            throw AppException.badRequest("Cannot change status of a completed appointment", "APPOINTMENT_STATUS_LOCKED");
        }
        if (status == AppointmentStatus.CANCELLED && a.getStatus() == AppointmentStatus.COMPLETED) {
            throw AppException.badRequest("Cannot cancel a completed appointment", "APPOINTMENT_CANNOT_CANCEL_COMPLETED");
        }
        a.setStatus(status);
        return toResponse(repository.save(a));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "Appointment")
    public AppointmentResponse cancel(Long id) {
        AppointmentResponse r = updateStatus(id, AppointmentStatus.CANCELLED);
        notifyAppointment(NotificationType.APPOINTMENT_CANCELLED, "NOTIFICATIONS.APPT_CANCELLED_TITLE", "NOTIFICATIONS.APPT_CANCELLED_BODY", r);
        return r;
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "Appointment")
    public AppointmentResponse confirm(Long id) {
        Appointment a = find(id);
        a.setStatus(AppointmentStatus.CONFIRMED);
        AppointmentResponse r = toResponse(repository.save(a));
        notifyAppointment(NotificationType.APPOINTMENT_CONFIRMED, "NOTIFICATIONS.APPT_CONFIRMED_TITLE", "NOTIFICATIONS.APPT_CONFIRMED_BODY", r);
        return r;
    }


    private void notifyAppointment(NotificationType type, String titleKey, String bodyKey, AppointmentResponse r) {
        Map<String, Object> vars = Map.of(
            "appointmentNo", r.getAppointmentNo() != null ? r.getAppointmentNo() : "",
            "patientName", r.getPatientName() != null ? r.getPatientName() : "",
            "doctorName", r.getDoctorName() != null ? r.getDoctorName() : "");
        notificationService.notifyStaff(type, titleKey, bodyKey, vars, "Appointment", r.getId(), currentActorId());
    }

    private Long currentActorId() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return p instanceof User u ? u.getId() : null;
    }

    private void checkOverlap(AppointmentRequest request, Long excludeId) {
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : request.getStartTime();
        if (repository.existsOverlap(request.getDoctorId(), request.getAppointmentDate(), request.getStartTime(), end, excludeId)) {
            throw AppException.conflict("Doctor already has an overlapping appointment at this time", "APPOINTMENT_OVERLAP");
        }
    }

    private Appointment build(AppointmentRequest r, AppointmentStatus status, String type) {
        return Appointment.builder().appointmentNo("APT-" + String.format("%06d", repository.count() + 1))
            .patientId(r.getPatientId()).doctorId(r.getDoctorId()).appointmentDate(r.getAppointmentDate())
            .startTime(r.getStartTime()).endTime(r.getEndTime()).status(status)
            .appointmentType(r.getAppointmentType() != null ? r.getAppointmentType() : type)
            .notes(r.getNotes()).active(true).branchId(branchContext.requireBranchIdForWrite()).build();
    }

    private Appointment find(Long id) {
        Appointment a = repository.findById(id).orElseThrow(() -> AppException.notFound("Appointment not found"));
        Long branchId = branchContext.getFilterBranchId();
        if (branchId != null && a.getBranchId() != null && !branchId.equals(a.getBranchId())) {
            throw AppException.notFound("Appointment not found");
        }
        return a;
    }

    public AppointmentResponse toResponse(Appointment a) {
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

    private static String trim(String q) { return SearchQueryUtil.normalize(q); }
}
