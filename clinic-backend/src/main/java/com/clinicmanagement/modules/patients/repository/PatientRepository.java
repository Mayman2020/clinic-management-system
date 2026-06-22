package com.clinicmanagement.modules.patients.repository;
import com.clinicmanagement.modules.patients.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.time.LocalDateTime;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    Optional<Patient> findByPatientCode(String patientCode);
    boolean existsByNationalIdAndActiveTrueAndIdNot(String nationalId, Long id);
    boolean existsByNationalIdAndActiveTrue(String nationalId);
    @Query("SELECT p FROM Patient p WHERE p.active = COALESCE(:active, p.active) AND (:q IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.patientCode) LIKE LOWER(CONCAT('%',:q,'%')) OR p.nationalId LIKE CONCAT('%',:q,'%'))")
    Page<Patient> search(@Param("q") String q, @Param("active") Boolean active, Pageable pageable);
}
