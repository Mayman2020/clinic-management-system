package com.clinicmanagement.modules.queue.repository;
import com.clinicmanagement.modules.queue.entity.QueueStatus;
import com.clinicmanagement.modules.queue.entity.QueueToken;
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
    Optional<QueueToken> findFirstByQueueDateAndStatusOrderByTokenNumberAsc(LocalDate date, QueueStatus status);
    long countByQueueDateAndStatus(LocalDate queueDate, QueueStatus status);
    List<QueueToken> findByQueueDateAndStatusInOrderByTokenNumberAsc(LocalDate date, List<QueueStatus> statuses);
}
