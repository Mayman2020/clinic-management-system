package com.clinicmanagement.modules.insurance.service;
import com.clinicmanagement.modules.audit.annotation.Auditable;
import com.clinicmanagement.modules.insurance.dto.*;
import com.clinicmanagement.modules.insurance.entity.*;
import com.clinicmanagement.modules.insurance.repository.*;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class InsuranceService {
    private final InsuranceProviderRepository providerRepository;
    private final ClaimRepository claimRepository;

    public List<InsuranceProviderDto> listProviders() {
        return providerRepository.findByActiveTrueOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    @Transactional @Auditable(action = "CREATE", entityType = "InsuranceProvider")
    public InsuranceProviderDto createProvider(InsuranceProviderDto dto) {
        InsuranceProvider p = InsuranceProvider.builder().name(dto.getName()).contactPhone(dto.getContactPhone())
            .contactEmail(dto.getContactEmail()).coverageNotes(dto.getCoverageNotes())
            .active(dto.getActive() == null || dto.getActive()).build();
        return toResponse(providerRepository.save(p));
    }

    public InsuranceProviderDto getProvider(Long id) {
        return toResponse(findProvider(id));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "InsuranceProvider")
    public InsuranceProviderDto updateProvider(Long id, InsuranceProviderDto dto) {
        InsuranceProvider p = findProvider(id);
        p.setName(dto.getName()); p.setContactPhone(dto.getContactPhone());
        p.setContactEmail(dto.getContactEmail()); p.setCoverageNotes(dto.getCoverageNotes());
        if (dto.getActive() != null) p.setActive(dto.getActive());
        return toResponse(providerRepository.save(p));
    }

    @Transactional @Auditable(action = "DELETE", entityType = "InsuranceProvider")
    public void deactivateProvider(Long id) {
        InsuranceProvider p = findProvider(id);
        p.setActive(false);
        providerRepository.save(p);
    }

    private InsuranceProvider findProvider(Long id) {
        return providerRepository.findById(id).orElseThrow(() -> AppException.notFound("Provider not found"));
    }

    public Page<ClaimDto> listClaims(Pageable pageable, String q, String status) {
        return claimRepository.search(trim(q), blankToNull(status), pageable).map(this::toResponse);
    }

    public ClaimDto getClaim(Long id) { return toResponse(findClaim(id)); }

    @Transactional @Auditable(action = "CREATE", entityType = "Claim")
    public ClaimDto submitClaim(ClaimDto dto) {
        Claim c = Claim.builder().claimNo("CLM-" + String.format("%06d", claimRepository.count() + 1))
            .patientId(dto.getPatientId()).providerId(dto.getProviderId()).invoiceId(dto.getInvoiceId())
            .amount(dto.getAmount()).copayment(dto.getCopayment()).status("PENDING")
            .submittedAt(LocalDateTime.now()).notes(dto.getNotes()).build();
        return toResponse(claimRepository.save(c));
    }

    @Transactional @Auditable(action = "UPDATE", entityType = "Claim")
    public ClaimDto updateClaimStatus(Long id, String status) {
        Claim c = findClaim(id);
        c.setStatus(status);
        if ("APPROVED".equalsIgnoreCase(status)) c.setApprovedAt(LocalDateTime.now());
        return toResponse(claimRepository.save(c));
    }

    private Claim findClaim(Long id) { return claimRepository.findById(id).orElseThrow(() -> AppException.notFound("Claim not found")); }

    public InsuranceProviderDto toResponse(InsuranceProvider p) {
        return InsuranceProviderDto.builder().id(p.getId()).name(p.getName()).contactPhone(p.getContactPhone())
            .contactEmail(p.getContactEmail()).coverageNotes(p.getCoverageNotes()).active(p.isActive()).build();
    }

    public ClaimDto toResponse(Claim c) {
        return ClaimDto.builder().id(c.getId()).claimNo(c.getClaimNo()).patientId(c.getPatientId())
            .providerId(c.getProviderId()).invoiceId(c.getInvoiceId()).amount(c.getAmount())
            .copayment(c.getCopayment()).status(c.getStatus()).submittedAt(c.getSubmittedAt())
            .approvedAt(c.getApprovedAt()).notes(c.getNotes()).build();
    }

    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }
    private static String blankToNull(String s) { return s == null || s.isBlank() ? null : s.trim(); }
}
