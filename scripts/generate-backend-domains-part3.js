/**
 * Domain modules part 3: appointments through audit
 */
module.exports = function registerDomainModulesPart3(ctx) {
  const { j, P } = ctx;

  // ─── Appointments ──────────────────────────────────────────────────────────
  j('modules/appointments/entity/AppointmentStatus.java', `package ${P}.modules.appointments.entity;
public enum AppointmentStatus {
    SCHEDULED, CONFIRMED, WAITING, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
}
`);

  j('modules/appointments/entity/Appointment.java', `package ${P}.modules.appointments.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity @Table(name = "appointments") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "appointment_no", unique = true, nullable = false, length = 30) private String appointmentNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(name = "appointment_date", nullable = false) private LocalDate appointmentDate;
    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time") private LocalTime endTime;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private AppointmentStatus status;
    @Column(name = "appointment_type", length = 20) private String appointmentType;
    @Column(columnDefinition = "TEXT") private String notes;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedBy @Column(name = "created_by", updatable = false) private Long createdBy;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/appointments/repository/AppointmentRepository.java', `package ${P}.modules.appointments.repository;
import ${P}.modules.appointments.entity.Appointment;
import ${P}.modules.appointments.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("SELECT a FROM Appointment a WHERE a.active = true AND a.appointmentDate BETWEEN :from AND :to AND (:doctorId IS NULL OR a.doctorId = :doctorId) AND (:status IS NULL OR a.status = :status)")
    List<Appointment> findCalendar(@Param("from") LocalDate from, @Param("to") LocalDate to,
        @Param("doctorId") Long doctorId, @Param("status") AppointmentStatus status);
    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :from AND :to GROUP BY a.status")
    List<Object[]> countByStatus(@Param("from") LocalDate from, @Param("to") LocalDate to);
    long countByAppointmentDateBetween(LocalDate from, LocalDate to);
}
`);

  j('modules/appointments/dto/AppointmentRequest.java', `package ${P}.modules.appointments.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    @NotNull private LocalDate appointmentDate;
    @NotNull private LocalTime startTime;
    private LocalTime endTime;
    private String appointmentType;
    private String notes;
}
`);

  j('modules/appointments/dto/AppointmentResponse.java', `package ${P}.modules.appointments.dto;
import ${P}.modules.appointments.entity.AppointmentStatus;
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
}
`);

  j('modules/appointments/service/AppointmentService.java', `package ${P}.modules.appointments.service;
import ${P}.modules.appointments.dto.*;
import ${P}.modules.appointments.entity.*;
import ${P}.modules.appointments.repository.AppointmentRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service @RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository repository;

    public List<AppointmentResponse> calendar(LocalDate from, LocalDate to, Long doctorId, AppointmentStatus status) {
        return repository.findCalendar(from, to, doctorId, status).stream().map(this::toResponse).toList();
    }
    public AppointmentResponse getById(Long id) { return toResponse(find(id)); }

    @Transactional
    public AppointmentResponse book(AppointmentRequest request) {
        return toResponse(repository.save(build(request, AppointmentStatus.SCHEDULED, "SCHEDULED")));
    }

    @Transactional
    public AppointmentResponse walkIn(AppointmentRequest request) {
        return toResponse(repository.save(build(request, AppointmentStatus.WAITING, "WALK_IN")));
    }

    @Transactional
    public AppointmentResponse reschedule(Long id, AppointmentRequest request) {
        Appointment a = find(id);
        a.setAppointmentDate(request.getAppointmentDate()); a.setStartTime(request.getStartTime());
        a.setEndTime(request.getEndTime()); a.setDoctorId(request.getDoctorId());
        if (request.getNotes() != null) a.setNotes(request.getNotes());
        return toResponse(repository.save(a));
    }

    @Transactional
    public AppointmentResponse cancel(Long id) { Appointment a = find(id); a.setStatus(AppointmentStatus.CANCELLED); return toResponse(repository.save(a)); }

    @Transactional
    public AppointmentResponse confirm(Long id) { Appointment a = find(id); a.setStatus(AppointmentStatus.CONFIRMED); return toResponse(repository.save(a)); }

    private Appointment build(AppointmentRequest r, AppointmentStatus status, String type) {
        return Appointment.builder().appointmentNo("APT-" + String.format("%06d", repository.count() + 1))
            .patientId(r.getPatientId()).doctorId(r.getDoctorId()).appointmentDate(r.getAppointmentDate())
            .startTime(r.getStartTime()).endTime(r.getEndTime()).status(status)
            .appointmentType(r.getAppointmentType() != null ? r.getAppointmentType() : type)
            .notes(r.getNotes()).active(true).build();
    }

    private Appointment find(Long id) { return repository.findById(id).orElseThrow(() -> AppException.notFound("Appointment not found")); }

    public AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder().id(a.getId()).appointmentNo(a.getAppointmentNo())
            .patientId(a.getPatientId()).doctorId(a.getDoctorId()).appointmentDate(a.getAppointmentDate())
            .startTime(a.getStartTime()).endTime(a.getEndTime()).status(a.getStatus())
            .appointmentType(a.getAppointmentType()).notes(a.getNotes()).active(a.isActive())
            .createdAt(a.getCreatedAt()).build();
    }
}
`);

  j('modules/appointments/controller/AppointmentController.java', `package ${P}.modules.appointments.controller;
import ${P}.modules.appointments.dto.*;
import ${P}.modules.appointments.entity.AppointmentStatus;
import ${P}.modules.appointments.service.AppointmentService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/appointments") @RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;
    @GetMapping("/calendar") @RequiresPermission(module = "calendar", action = "view")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> calendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.calendar(from, to, doctorId, status)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "appointments", action = "view")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getById(id)));
    }
    @PostMapping("/book") @RequiresPermission(module = "appointments", action = "create")
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.book(request)));
    }
    @PostMapping("/walk-in") @RequiresPermission(module = "appointments", action = "create")
    public ResponseEntity<ApiResponse<AppointmentResponse>> walkIn(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.walkIn(request)));
    }
    @PutMapping("/{id}/reschedule") @RequiresPermission(module = "appointments", action = "edit")
    public ResponseEntity<ApiResponse<AppointmentResponse>> reschedule(@PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.reschedule(id, request)));
    }
    @PostMapping("/{id}/cancel") @RequiresPermission(module = "appointments", action = "edit")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.cancel(id)));
    }
    @PostMapping("/{id}/confirm") @RequiresPermission(module = "appointments", action = "approve")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.confirm(id)));
    }
}
`);

  // ─── Queue ─────────────────────────────────────────────────────────────────
  j('modules/queue/entity/QueueStatus.java', `package ${P}.modules.queue.entity;
public enum QueueStatus { WAITING, CALLED, IN_SERVICE, COMPLETED, SKIPPED }
`);

  j('modules/queue/entity/QueueToken.java', `package ${P}.modules.queue.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "queue_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QueueToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "token_number", nullable = false) private Integer tokenNumber;
    @Column(name = "queue_date", nullable = false) private LocalDate queueDate;
    @Column(name = "doctor_id") private Long doctorId;
    @Column(length = 100) private String department;
    @Column(name = "patient_id") private Long patientId;
    @Column(name = "appointment_id") private Long appointmentId;
    @Enumerated(EnumType.STRING) @Column(length = 20) private QueueStatus status;
    @Column(name = "estimated_wait_minutes") private Integer estimatedWaitMinutes;
    @Column(name = "called_at") private LocalDateTime calledAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
`);

  j('modules/queue/repository/QueueTokenRepository.java', `package ${P}.modules.queue.repository;
import ${P}.modules.queue.entity.QueueStatus;
import ${P}.modules.queue.entity.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {
    @Query("SELECT COALESCE(MAX(q.tokenNumber), 0) FROM QueueToken q WHERE q.queueDate = :date AND (:doctorId IS NULL OR q.doctorId = :doctorId)")
    Integer maxTokenNumber(@Param("date") LocalDate date, @Param("doctorId") Long doctorId);
    List<QueueToken> findByQueueDateAndDoctorIdOrderByTokenNumberAsc(LocalDate date, Long doctorId);
    List<QueueToken> findByQueueDateOrderByTokenNumberAsc(LocalDate date);
    @Query("SELECT q.status, COUNT(q) FROM QueueToken q WHERE q.queueDate = :date GROUP BY q.status")
    List<Object[]> countByStatus(@Param("date") LocalDate date);
    Optional<QueueToken> findFirstByQueueDateAndDoctorIdAndStatusOrderByTokenNumberAsc(LocalDate date, Long doctorId, QueueStatus status);
}
`);

  j('modules/queue/dto/QueueTokenRequest.java', `package ${P}.modules.queue.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class QueueTokenRequest {
    @NotNull private LocalDate queueDate;
    private Long doctorId;
    private String department;
    private Long patientId;
    private Long appointmentId;
}
`);

  j('modules/queue/dto/QueueTokenResponse.java', `package ${P}.modules.queue.dto;
import ${P}.modules.queue.entity.QueueStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class QueueTokenResponse {
    private Long id;
    private Integer tokenNumber;
    private LocalDate queueDate;
    private Long doctorId;
    private String department;
    private Long patientId;
    private Long appointmentId;
    private QueueStatus status;
    private Integer estimatedWaitMinutes;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
}
`);

  j('modules/queue/dto/QueueDashboardResponse.java', `package ${P}.modules.queue.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class QueueDashboardResponse {
    private long waiting;
    private long called;
    private long inService;
    private long completed;
    private List<QueueTokenResponse> tokens;
    private Map<String, Long> statusChart;
}
`);

  j('modules/queue/service/QueueService.java', `package ${P}.modules.queue.service;
import ${P}.modules.queue.dto.*;
import ${P}.modules.queue.entity.*;
import ${P}.modules.queue.repository.QueueTokenRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class QueueService {
    private final QueueTokenRepository repository;

    @Transactional
    public QueueTokenResponse generateToken(QueueTokenRequest request) {
        int next = repository.maxTokenNumber(request.getQueueDate(), request.getDoctorId()) + 1;
        QueueToken token = QueueToken.builder().tokenNumber(next).queueDate(request.getQueueDate())
            .doctorId(request.getDoctorId()).department(request.getDepartment())
            .patientId(request.getPatientId()).appointmentId(request.getAppointmentId())
            .status(QueueStatus.WAITING).build();
        return toResponse(repository.save(token));
    }

    public QueueTokenResponse current(LocalDate date, Long doctorId) {
        return repository.findFirstByQueueDateAndDoctorIdAndStatusOrderByTokenNumberAsc(date, doctorId, QueueStatus.WAITING)
            .map(this::toResponse)
            .orElseThrow(() -> AppException.notFound("No waiting token"));
    }

    public QueueDashboardResponse dashboard(LocalDate date, Long doctorId) {
        List<QueueToken> tokens = doctorId == null ? repository.findByQueueDateOrderByTokenNumberAsc(date)
            : repository.findByQueueDateAndDoctorIdOrderByTokenNumberAsc(date, doctorId);
        Map<String, Long> chart = new LinkedHashMap<>();
        for (Object[] row : repository.countByStatus(date)) chart.put(String.valueOf(row[0]), (Long) row[1]);
        return QueueDashboardResponse.builder()
            .waiting(tokens.stream().filter(t -> t.getStatus() == QueueStatus.WAITING).count())
            .called(tokens.stream().filter(t -> t.getStatus() == QueueStatus.CALLED).count())
            .inService(tokens.stream().filter(t -> t.getStatus() == QueueStatus.IN_SERVICE).count())
            .completed(tokens.stream().filter(t -> t.getStatus() == QueueStatus.COMPLETED).count())
            .tokens(tokens.stream().map(this::toResponse).toList()).statusChart(chart).build();
    }

    @Transactional
    public QueueTokenResponse updateStatus(Long id, QueueStatus status) {
        QueueToken t = repository.findById(id).orElseThrow(() -> AppException.notFound("Token not found"));
        t.setStatus(status);
        if (status == QueueStatus.CALLED) t.setCalledAt(LocalDateTime.now());
        if (status == QueueStatus.COMPLETED) t.setCompletedAt(LocalDateTime.now());
        return toResponse(repository.save(t));
    }

    public QueueTokenResponse toResponse(QueueToken t) {
        return QueueTokenResponse.builder().id(t.getId()).tokenNumber(t.getTokenNumber()).queueDate(t.getQueueDate())
            .doctorId(t.getDoctorId()).department(t.getDepartment()).patientId(t.getPatientId())
            .appointmentId(t.getAppointmentId()).status(t.getStatus())
            .estimatedWaitMinutes(t.getEstimatedWaitMinutes()).calledAt(t.getCalledAt())
            .completedAt(t.getCompletedAt()).build();
    }
}
`);

  j('modules/queue/controller/QueueController.java', `package ${P}.modules.queue.controller;
import ${P}.modules.queue.dto.*;
import ${P}.modules.queue.entity.QueueStatus;
import ${P}.modules.queue.service.QueueService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController @RequestMapping("/queue") @RequiredArgsConstructor
public class QueueController {
    private final QueueService queueService;
    @PostMapping("/tokens") @RequiresPermission(module = "queue", action = "create")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> generate(@Valid @RequestBody QueueTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.generateToken(request)));
    }
    @GetMapping("/current") @RequiresPermission(module = "queue", action = "view")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> current(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.current(date, doctorId)));
    }
    @GetMapping("/dashboard") @RequiresPermission(module = "queue", action = "view")
    public ResponseEntity<ApiResponse<QueueDashboardResponse>> dashboard(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.dashboard(date, doctorId)));
    }
    @PatchMapping("/tokens/{id}/status") @RequiresPermission(module = "queue", action = "edit")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> updateStatus(@PathVariable Long id, @RequestParam QueueStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.updateStatus(id, status)));
    }
}
`);

  // ─── Consultation ──────────────────────────────────────────────────────────
  j('modules/consultation/entity/Consultation.java', `package ${P}.modules.consultation.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "consultations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Consultation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "appointment_id") private Long appointmentId;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(columnDefinition = "TEXT") private String symptoms;
    @Column(columnDefinition = "TEXT") private String diagnosis;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "treatment_plan", columnDefinition = "TEXT") private String treatmentPlan;
    @Column(name = "follow_up_date") private LocalDate followUpDate;
    @Column(length = 20) private String status;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/consultation/repository/ConsultationRepository.java', `package ${P}.modules.consultation.repository;
import ${P}.modules.consultation.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
`);

  j('modules/consultation/dto/ConsultationRequest.java', `package ${P}.modules.consultation.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ConsultationRequest {
    private Long appointmentId;
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String status;
}
`);

  j('modules/consultation/dto/ConsultationResponse.java', `package ${P}.modules.consultation.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class ConsultationResponse {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String symptoms;
    private String diagnosis;
    private String notes;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String status;
    private LocalDateTime createdAt;
}
`);

  j('modules/consultation/service/ConsultationService.java', `package ${P}.modules.consultation.service;
import ${P}.modules.consultation.dto.*;
import ${P}.modules.consultation.entity.Consultation;
import ${P}.modules.consultation.repository.ConsultationRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class ConsultationService {
    private final ConsultationRepository repository;

    public ConsultationResponse getById(Long id) { return toResponse(find(id)); }
    public List<ConsultationResponse> byPatient(Long patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ConsultationResponse create(ConsultationRequest request) {
        Consultation c = Consultation.builder().appointmentId(request.getAppointmentId())
            .patientId(request.getPatientId()).doctorId(request.getDoctorId())
            .symptoms(request.getSymptoms()).diagnosis(request.getDiagnosis()).notes(request.getNotes())
            .treatmentPlan(request.getTreatmentPlan()).followUpDate(request.getFollowUpDate())
            .status(request.getStatus() != null ? request.getStatus() : "IN_PROGRESS").build();
        return toResponse(repository.save(c));
    }

    @Transactional
    public ConsultationResponse update(Long id, ConsultationRequest request) {
        Consultation c = find(id);
        c.setSymptoms(request.getSymptoms()); c.setDiagnosis(request.getDiagnosis());
        c.setNotes(request.getNotes()); c.setTreatmentPlan(request.getTreatmentPlan());
        c.setFollowUpDate(request.getFollowUpDate());
        if (request.getStatus() != null) c.setStatus(request.getStatus());
        return toResponse(repository.save(c));
    }

    private Consultation find(Long id) { return repository.findById(id).orElseThrow(() -> AppException.notFound("Consultation not found")); }

    public ConsultationResponse toResponse(Consultation c) {
        return ConsultationResponse.builder().id(c.getId()).appointmentId(c.getAppointmentId())
            .patientId(c.getPatientId()).doctorId(c.getDoctorId()).symptoms(c.getSymptoms())
            .diagnosis(c.getDiagnosis()).notes(c.getNotes()).treatmentPlan(c.getTreatmentPlan())
            .followUpDate(c.getFollowUpDate()).status(c.getStatus()).createdAt(c.getCreatedAt()).build();
    }
}
`);

  j('modules/consultation/controller/ConsultationController.java', `package ${P}.modules.consultation.controller;
import ${P}.modules.consultation.dto.*;
import ${P}.modules.consultation.service.ConsultationService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/consultations") @RequiredArgsConstructor
public class ConsultationController {
    private final ConsultationService consultationService;
    @GetMapping("/{id}") @RequiresPermission(module = "consultation", action = "view")
    public ResponseEntity<ApiResponse<ConsultationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.getById(id)));
    }
    @GetMapping("/patient/{patientId}") @RequiresPermission(module = "consultation", action = "view")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.byPatient(patientId)));
    }
    @PostMapping @RequiresPermission(module = "consultation", action = "create")
    public ResponseEntity<ApiResponse<ConsultationResponse>> create(@Valid @RequestBody ConsultationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.create(request)));
    }
    @PutMapping("/{id}") @RequiresPermission(module = "consultation", action = "edit")
    public ResponseEntity<ApiResponse<ConsultationResponse>> update(@PathVariable Long id, @Valid @RequestBody ConsultationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(consultationService.update(id, request)));
    }
}
`);

  // Part 4 for prescription, lab, radiology, billing, insurance, dashboard, settings, audit
  require('./generate-backend-domains-part4')(ctx);
};
