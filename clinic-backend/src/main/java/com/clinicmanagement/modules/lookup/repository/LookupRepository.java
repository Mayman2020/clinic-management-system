package com.clinicmanagement.modules.lookup.repository;

import com.clinicmanagement.modules.lookup.entity.Lookup;
import com.clinicmanagement.modules.lookup.entity.LookupType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LookupRepository extends JpaRepository<Lookup, Long> {
    List<Lookup> findByTypeAndActiveTrueOrderBySortOrderAscNameEnAsc(LookupType type);
    List<Lookup> findByTypeOrderBySortOrderAscNameEnAsc(LookupType type);
    Optional<Lookup> findByTypeAndCodeIgnoreCase(LookupType type, String code);
    boolean existsByTypeAndCodeIgnoreCase(LookupType type, String code);
    long countByType(LookupType type);
}
