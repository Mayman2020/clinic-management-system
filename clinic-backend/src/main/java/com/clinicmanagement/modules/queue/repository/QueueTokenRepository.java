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
    @Query("SELECT COALESCE(MAX(q.tokenNumber), 0) FROM QueueToken q WHERE q.queueDate = :date AND (:doctorId IS NULL OR q.doctorId = :doctorId) AND (:branchId IS NULL OR q.branchId = :branchId)")
    Integer maxTokenNumber(@Param("date") LocalDate date, @Param("doctorId") Long doctorId, @Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.queueDate = :date AND (:branchId IS NULL OR q.branchId = :branchId) ORDER BY q.tokenNumber ASC")
    List<QueueToken> findByQueueDate(@Param("date") LocalDate date, @Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.queueDate = :date AND q.doctorId = :doctorId AND (:branchId IS NULL OR q.branchId = :branchId) ORDER BY q.tokenNumber ASC")
    List<QueueToken> findByQueueDateAndDoctorId(@Param("date") LocalDate date, @Param("doctorId") Long doctorId, @Param("branchId") Long branchId);

    @Query("SELECT q.status, COUNT(q) FROM QueueToken q WHERE q.queueDate = :date AND (:branchId IS NULL OR q.branchId = :branchId) GROUP BY q.status")
    List<Object[]> countByStatus(@Param("date") LocalDate date, @Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.queueDate = :date AND q.status IN :statuses AND (:branchId IS NULL OR q.branchId = :branchId) ORDER BY q.tokenNumber ASC")
    List<QueueToken> findByQueueDateAndStatusIn(@Param("date") LocalDate date, @Param("statuses") List<QueueStatus> statuses, @Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.queueDate = :date AND q.doctorId = :doctorId AND q.status = :status AND (:branchId IS NULL OR q.branchId = :branchId) ORDER BY q.tokenNumber ASC")
    Optional<QueueToken> findFirstWaiting(@Param("date") LocalDate date, @Param("doctorId") Long doctorId, @Param("status") QueueStatus status, @Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.queueDate = :date AND q.status = :status AND (:branchId IS NULL OR q.branchId = :branchId) ORDER BY q.tokenNumber ASC")
    Optional<QueueToken> findFirstWaitingAnyDoctor(@Param("date") LocalDate date, @Param("status") QueueStatus status, @Param("branchId") Long branchId);

    @Query("SELECT COUNT(q) FROM QueueToken q WHERE q.queueDate = :date AND q.status = :status AND (:branchId IS NULL OR q.branchId = :branchId)")
    long countByQueueDateAndStatus(@Param("date") LocalDate date, @Param("status") QueueStatus status, @Param("branchId") Long branchId);
}
