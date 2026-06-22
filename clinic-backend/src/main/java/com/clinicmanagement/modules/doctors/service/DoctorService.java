package com.clinicmanagement.modules.doctors.service;
import com.clinicmanagement.modules.doctors.dto.*;
import com.clinicmanagement.modules.doctors.entity.*;
import com.clinicmanagement.modules.doctors.repository.*;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;

    public Page<DoctorResponse> search(String q, Specialty specialty, Boolean active, Pageable pageable) {
        return doctorRepository.search(trim(q), specialty, active, pageable).map(this::toResponse);
    }
    public DoctorResponse getById(Long id) { return toResponse(find(id)); }
    public List<DoctorResponse> listActive() { return doctorRepository.findByActiveTrue().stream().map(this::toResponse).toList(); }

    @Transactional
    public DoctorResponse create(DoctorRequest request) {
        Doctor d = Doctor.builder().doctorCode("DOC-" + String.format("%03d", doctorRepository.count() + 1))
            .userId(request.getUserId()).firstName(request.getFirstName()).lastName(request.getLastName())
            .specialty(request.getSpecialty()).department(request.getDepartment()).phone(request.getPhone())
            .email(request.getEmail()).consultationFee(request.getConsultationFee()).bio(request.getBio())
            .active(request.getActive() == null || request.getActive()).build();
        return toResponse(doctorRepository.save(d));
    }

    @Transactional
    public DoctorResponse update(Long id, DoctorRequest request) {
        Doctor d = find(id);
        d.setUserId(request.getUserId()); d.setFirstName(request.getFirstName()); d.setLastName(request.getLastName());
        d.setSpecialty(request.getSpecialty()); d.setDepartment(request.getDepartment());
        d.setPhone(request.getPhone()); d.setEmail(request.getEmail());
        d.setConsultationFee(request.getConsultationFee()); d.setBio(request.getBio());
        if (request.getActive() != null) d.setActive(request.getActive());
        return toResponse(doctorRepository.save(d));
    }

    @Transactional
    public DoctorScheduleResponse addSchedule(Long doctorId, DoctorScheduleRequest request) {
        find(doctorId);
        DoctorSchedule s = DoctorSchedule.builder().doctorId(doctorId).dayOfWeek(request.getDayOfWeek())
            .startTime(request.getStartTime()).endTime(request.getEndTime())
            .active(request.getActive() == null || request.getActive()).build();
        return toScheduleResponse(scheduleRepository.save(s));
    }

    public List<DoctorScheduleResponse> listSchedules(Long doctorId) {
        return scheduleRepository.findByDoctorIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(doctorId)
            .stream().map(this::toScheduleResponse).toList();
    }

    private Doctor find(Long id) { return doctorRepository.findById(id).orElseThrow(() -> AppException.notFound("Doctor not found")); }
    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }

    public DoctorResponse toResponse(Doctor d) {
        return DoctorResponse.builder().id(d.getId()).userId(d.getUserId()).doctorCode(d.getDoctorCode())
            .firstName(d.getFirstName()).lastName(d.getLastName()).specialty(d.getSpecialty())
            .department(d.getDepartment()).phone(d.getPhone()).email(d.getEmail())
            .consultationFee(d.getConsultationFee()).bio(d.getBio()).active(d.isActive())
            .schedules(listSchedules(d.getId())).createdAt(d.getCreatedAt()).build();
    }

    private DoctorScheduleResponse toScheduleResponse(DoctorSchedule s) {
        return DoctorScheduleResponse.builder().id(s.getId()).doctorId(s.getDoctorId())
            .dayOfWeek(s.getDayOfWeek()).startTime(s.getStartTime()).endTime(s.getEndTime()).active(s.isActive()).build();
    }
}
