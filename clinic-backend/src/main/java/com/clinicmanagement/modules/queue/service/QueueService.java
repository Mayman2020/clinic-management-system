package com.clinicmanagement.modules.queue.service;
import com.clinicmanagement.modules.doctors.repository.DoctorRepository;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.queue.dto.*;
import com.clinicmanagement.modules.queue.entity.*;
import com.clinicmanagement.modules.queue.repository.QueueTokenRepository;
import com.clinicmanagement.shared.exception.AppException;
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
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final QueueEventPublisher eventPublisher;

    @Transactional
    public QueueTokenResponse generateToken(QueueTokenRequest request) {
        int next = repository.maxTokenNumber(request.getQueueDate(), request.getDoctorId()) + 1;
        QueueToken token = QueueToken.builder().tokenNumber(next).queueDate(request.getQueueDate())
            .doctorId(request.getDoctorId()).department(request.getDepartment())
            .patientId(request.getPatientId()).appointmentId(request.getAppointmentId())
            .status(QueueStatus.WAITING).build();
        QueueTokenResponse response = toResponse(repository.save(token));
        eventPublisher.publishUpdate();
        return response;
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

    public List<QueueTokenResponse> todayTokens(Long doctorId) {
        LocalDate today = LocalDate.now();
        List<QueueToken> tokens = doctorId == null
            ? repository.findByQueueDateOrderByTokenNumberAsc(today)
            : repository.findByQueueDateAndDoctorIdOrderByTokenNumberAsc(today, doctorId);
        return tokens.stream().map(this::toResponse).toList();
    }

    @Transactional
    public QueueTokenResponse callNext(Long doctorId) {
        LocalDate today = LocalDate.now();
        QueueToken next = (doctorId != null
            ? repository.findFirstByQueueDateAndDoctorIdAndStatusOrderByTokenNumberAsc(today, doctorId, QueueStatus.WAITING)
            : repository.findFirstByQueueDateAndStatusOrderByTokenNumberAsc(today, QueueStatus.WAITING))
            .orElseThrow(() -> AppException.notFound("No waiting token"));
        next.setStatus(QueueStatus.CALLED);
        next.setCalledAt(LocalDateTime.now());
        QueueTokenResponse response = toResponse(repository.save(next));
        eventPublisher.publishUpdate();
        return response;
    }

    public List<QueueTokenResponse> tvDisplay() {
        LocalDate today = LocalDate.now();
        return repository.findByQueueDateAndStatusInOrderByTokenNumberAsc(today,
            List.of(QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE))
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public QueueTokenResponse updateStatus(Long id, QueueStatus status) {
        QueueToken t = repository.findById(id).orElseThrow(() -> AppException.notFound("Token not found"));
        t.setStatus(status);
        if (status == QueueStatus.CALLED) t.setCalledAt(LocalDateTime.now());
        if (status == QueueStatus.COMPLETED) t.setCompletedAt(LocalDateTime.now());
        QueueTokenResponse response = toResponse(repository.save(t));
        eventPublisher.publishUpdate();
        return response;
    }

    public QueueTokenResponse toResponse(QueueToken t) {
        String patientName = patientRepository.findById(t.getPatientId())
            .map(p -> p.getFirstName() + " " + p.getLastName()).orElse(null);
        String doctorName = t.getDoctorId() == null ? null : doctorRepository.findById(t.getDoctorId())
            .map(d -> d.getFirstName() + " " + d.getLastName()).orElse(null);
        return QueueTokenResponse.builder().id(t.getId()).tokenNumber(t.getTokenNumber()).queueDate(t.getQueueDate())
            .doctorId(t.getDoctorId()).doctorName(doctorName).department(t.getDepartment()).patientId(t.getPatientId())
            .patientName(patientName).appointmentId(t.getAppointmentId()).status(t.getStatus())
            .estimatedWaitMinutes(t.getEstimatedWaitMinutes()).calledAt(t.getCalledAt())
            .completedAt(t.getCompletedAt()).build();
    }
}
