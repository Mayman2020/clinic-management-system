package com.clinicmanagement.modules.doctors.repository;
import com.clinicmanagement.modules.doctors.entity.Doctor;
import com.clinicmanagement.modules.doctors.entity.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    @Query("SELECT d FROM Doctor d WHERE (:active IS NULL OR d.active = :active) AND (:specialty IS NULL OR d.specialty = :specialty) AND (:q = '' OR LOWER(d.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(d.lastName) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Doctor> search(@Param("q") String q, @Param("specialty") Specialty specialty, @Param("active") Boolean active, Pageable pageable);
    List<Doctor> findByActiveTrue();
}
