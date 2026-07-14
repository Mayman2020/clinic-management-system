package com.clinicmanagement.modules.appointments.repository;
import com.clinicmanagement.modules.appointments.entity.Appointment;
import com.clinicmanagement.modules.appointments.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("SELECT a FROM Appointment a WHERE a.active = true AND (:branchId IS NULL OR a.branchId = :branchId) AND (:status IS NULL OR a.status = :status) AND (:doctorId IS NULL OR a.doctorId = :doctorId) AND (:q = '' OR LOWER(a.appointmentNo) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Appointment> search(@Param("q") String q, @Param("status") AppointmentStatus status, @Param("doctorId") Long doctorId, @Param("branchId") Long branchId, Pageable pageable);
    @Query("SELECT a FROM Appointment a WHERE a.active = true AND (:branchId IS NULL OR a.branchId = :branchId) AND a.status IN :statuses AND (:doctorId IS NULL OR a.doctorId = :doctorId) AND (:q = '' OR LOWER(a.appointmentNo) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Appointment> searchByStatuses(@Param("q") String q, @Param("statuses") List<AppointmentStatus> statuses, @Param("doctorId") Long doctorId, @Param("branchId") Long branchId, Pageable pageable);
    @Query("SELECT a FROM Appointment a WHERE a.active = true AND (:branchId IS NULL OR a.branchId = :branchId) AND a.appointmentDate BETWEEN :from AND :to AND (:doctorId IS NULL OR a.doctorId = :doctorId) AND (:status IS NULL OR a.status = :status)")
    List<Appointment> findCalendar(@Param("from") LocalDate from, @Param("to") LocalDate to,
        @Param("doctorId") Long doctorId, @Param("status") AppointmentStatus status, @Param("branchId") Long branchId);
    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :from AND :to GROUP BY a.status")
    List<Object[]> countByStatus(@Param("from") LocalDate from, @Param("to") LocalDate to);
    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :from AND :to AND (:branchId IS NULL OR a.branchId = :branchId) GROUP BY a.status")
    List<Object[]> countByStatus(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("branchId") Long branchId);
    long countByAppointmentDateBetween(LocalDate from, LocalDate to);
    long countByAppointmentDate(LocalDate date);
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.active = true AND a.appointmentDate = :date AND (:branchId IS NULL OR a.branchId = :branchId)")
    long countByAppointmentDateAndBranchId(@Param("date") LocalDate date, @Param("branchId") Long branchId);
    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);
    long countByDoctorIdAndStatusAndAppointmentDateBetween(Long doctorId, AppointmentStatus status, LocalDate from, LocalDate to);
    @Query("""
        SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a
        WHERE a.active = true AND a.doctorId = :doctorId AND a.appointmentDate = :date
        AND a.status NOT IN (com.clinicmanagement.modules.appointments.entity.AppointmentStatus.CANCELLED, com.clinicmanagement.modules.appointments.entity.AppointmentStatus.NO_SHOW)
        AND (:excludeId IS NULL OR a.id <> :excludeId)
        AND a.startTime < :endTime AND :startTime < COALESCE(a.endTime, a.startTime)
        """)
    boolean existsOverlap(@Param("doctorId") Long doctorId, @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime, @Param("excludeId") Long excludeId);
    List<Appointment> findByPatientIdAndActiveTrueOrderByAppointmentDateDescStartTimeDesc(Long patientId);
    List<Appointment> findByActiveTrueAndAppointmentDateAndStatusIn(LocalDate appointmentDate, List<AppointmentStatus> statuses);
}
