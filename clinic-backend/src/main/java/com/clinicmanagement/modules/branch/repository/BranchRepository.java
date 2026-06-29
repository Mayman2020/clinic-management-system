package com.clinicmanagement.modules.branch.repository;
import com.clinicmanagement.modules.branch.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByActiveTrueOrderByNameAsc();
    Optional<Branch> findByDefaultBranchTrue();
    Optional<Branch> findByBranchCodeIgnoreCase(String branchCode);
    boolean existsByBranchCodeIgnoreCase(String branchCode);
}
