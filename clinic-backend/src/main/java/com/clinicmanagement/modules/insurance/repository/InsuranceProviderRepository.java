package com.clinicmanagement.modules.insurance.repository;
import com.clinicmanagement.modules.insurance.entity.InsuranceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InsuranceProviderRepository extends JpaRepository<InsuranceProvider, Long> {
    List<InsuranceProvider> findByActiveTrueOrderByNameAsc();
}
