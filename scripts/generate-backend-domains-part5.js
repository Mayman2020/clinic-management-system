/**
 * Domain modules part 5: insurance, dashboard, settings, audit
 */
module.exports = function registerDomainModulesPart5(ctx) {
  const { j, P } = ctx;

  // ─── Insurance ─────────────────────────────────────────────────────────────
  j('modules/insurance/entity/InsuranceProvider.java', `package ${P}.modules.insurance.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "insurance_providers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InsuranceProvider {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 200) private String name;
    @Column(name = "contact_phone", length = 20) private String contactPhone;
    @Column(name = "contact_email", length = 150) private String contactEmail;
    @Column(name = "coverage_notes", columnDefinition = "TEXT") private String coverageNotes;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/insurance/entity/Claim.java', `package ${P}.modules.insurance.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "claims")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Claim {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "claim_no", unique = true, nullable = false, length = 30) private String claimNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "provider_id") private Long providerId;
    @Column(name = "invoice_id") private Long invoiceId;
    @Column(nullable = false) private BigDecimal amount;
    private BigDecimal copayment;
    @Column(length = 30) private String status;
    @Column(name = "submitted_at") private LocalDateTime submittedAt;
    @Column(name = "approved_at") private LocalDateTime approvedAt;
    @Column(columnDefinition = "TEXT") private String notes;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/insurance/repository/InsuranceProviderRepository.java', `package ${P}.modules.insurance.repository;
import ${P}.modules.insurance.entity.InsuranceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InsuranceProviderRepository extends JpaRepository<InsuranceProvider, Long> {
    List<InsuranceProvider> findByActiveTrueOrderByNameAsc();
}
`);

  j('modules/insurance/repository/ClaimRepository.java', `package ${P}.modules.insurance.repository;
import ${P}.modules.insurance.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    @Query("SELECT c.status, COUNT(c) FROM Claim c GROUP BY c.status")
    List<Object[]> countByStatus();
    @Query("SELECT c.status, COUNT(c) FROM Claim c WHERE c.createdAt >= :from GROUP BY c.status")
    List<Object[]> countByStatusSince(@Param("from") java.time.LocalDateTime from);
}
`);

  j('modules/insurance/dto/InsuranceProviderDto.java', `package ${P}.modules.insurance.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class InsuranceProviderDto {
    private Long id;
    @NotBlank private String name;
    private String contactPhone;
    private String contactEmail;
    private String coverageNotes;
    private boolean active;
}
`);

  j('modules/insurance/dto/ClaimDto.java', `package ${P}.modules.insurance.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class ClaimDto {
    private Long id;
    private String claimNo;
    @NotNull private Long patientId;
    private Long providerId;
    private Long invoiceId;
    @NotNull private BigDecimal amount;
    private BigDecimal copayment;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private String notes;
}
`);

  j('modules/insurance/service/InsuranceService.java', `package ${P}.modules.insurance.service;
import ${P}.modules.insurance.dto.*;
import ${P}.modules.insurance.entity.*;
import ${P}.modules.insurance.repository.*;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
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

    @Transactional
    public InsuranceProviderDto createProvider(InsuranceProviderDto dto) {
        InsuranceProvider p = InsuranceProvider.builder().name(dto.getName()).contactPhone(dto.getContactPhone())
            .contactEmail(dto.getContactEmail()).coverageNotes(dto.getCoverageNotes())
            .active(dto.isActive() || true).build();
        return toResponse(providerRepository.save(p));
    }

    public ClaimDto getClaim(Long id) { return toResponse(findClaim(id)); }

    @Transactional
    public ClaimDto submitClaim(ClaimDto dto) {
        Claim c = Claim.builder().claimNo("CLM-" + String.format("%06d", claimRepository.count() + 1))
            .patientId(dto.getPatientId()).providerId(dto.getProviderId()).invoiceId(dto.getInvoiceId())
            .amount(dto.getAmount()).copayment(dto.getCopayment()).status("PENDING")
            .submittedAt(LocalDateTime.now()).notes(dto.getNotes()).build();
        return toResponse(claimRepository.save(c));
    }

    @Transactional
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
}
`);

  j('modules/insurance/controller/InsuranceController.java', `package ${P}.modules.insurance.controller;
import ${P}.modules.insurance.dto.*;
import ${P}.modules.insurance.service.InsuranceService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/insurance") @RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;
    @GetMapping("/providers") @RequiresPermission(module = "insurance", action = "view")
    public ResponseEntity<ApiResponse<List<InsuranceProviderDto>>> listProviders() {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.listProviders()));
    }
    @PostMapping("/providers") @RequiresPermission(module = "insurance", action = "create")
    public ResponseEntity<ApiResponse<InsuranceProviderDto>> createProvider(@Valid @RequestBody InsuranceProviderDto request) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.createProvider(request)));
    }
    @GetMapping("/claims/{id}") @RequiresPermission(module = "insurance", action = "view")
    public ResponseEntity<ApiResponse<ClaimDto>> getClaim(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.getClaim(id)));
    }
    @PostMapping("/claims") @RequiresPermission(module = "insurance", action = "create")
    public ResponseEntity<ApiResponse<ClaimDto>> submitClaim(@Valid @RequestBody ClaimDto request) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.submitClaim(request)));
    }
    @PatchMapping("/claims/{id}/status") @RequiresPermission(module = "insurance", action = "approve")
    public ResponseEntity<ApiResponse<ClaimDto>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok(insuranceService.updateClaimStatus(id, status)));
    }
}
`);

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  j('modules/dashboard/dto/ChartPoint.java', `package ${P}.modules.dashboard.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class ChartPoint {
    private String label;
    private BigDecimal value;
    private Long count;
}
`);

  j('modules/dashboard/dto/DashboardReportResponse.java', `package ${P}.modules.dashboard.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardReportResponse {
    private List<ChartPoint> dailyRevenue;
    private List<ChartPoint> monthlyRevenue;
    private List<ChartPoint> doctorPerformance;
    private List<ChartPoint> topServices;
    private Map<String, Long> appointmentStats;
    private Map<String, Long> insuranceClaims;
    private Map<String, Long> patientStats;
}
`);

  j('modules/dashboard/service/DashboardService.java', `package ${P}.modules.dashboard.service;
import ${P}.modules.appointments.repository.AppointmentRepository;
import ${P}.modules.billing.repository.InvoiceRepository;
import ${P}.modules.dashboard.dto.*;
import ${P}.modules.insurance.repository.ClaimRepository;
import ${P}.modules.patients.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;

@Service @RequiredArgsConstructor
public class DashboardService {
    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final ClaimRepository claimRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public DashboardReportResponse buildReport() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        List<ChartPoint> dailyRevenue = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = weekStart.plusDays(i);
            LocalDateTime from = d.atStartOfDay();
            LocalDateTime to = d.atTime(LocalTime.MAX);
            BigDecimal sum = invoiceRepository.sumPaidBetween(from, to);
            dailyRevenue.add(ChartPoint.builder().label(d.toString()).value(sum == null ? BigDecimal.ZERO : sum).build());
        }

        List<ChartPoint> monthlyRevenue = new ArrayList<>();
        YearMonth ym = YearMonth.now();
        for (int m = 0; m < 6; m++) {
            YearMonth month = ym.minusMonths(5 - m);
            LocalDateTime from = month.atDay(1).atStartOfDay();
            LocalDateTime to = month.atEndOfMonth().atTime(LocalTime.MAX);
            BigDecimal sum = invoiceRepository.sumPaidBetween(from, to);
            monthlyRevenue.add(ChartPoint.builder().label(month.toString()).value(sum == null ? BigDecimal.ZERO : sum).build());
        }

        List<ChartPoint> topServices = new ArrayList<>();
        for (Object[] row : invoiceRepository.topServices()) {
            topServices.add(ChartPoint.builder().label(String.valueOf(row[0])).value((BigDecimal) row[1]).build());
        }

        Map<String, Long> appointmentStats = new LinkedHashMap<>();
        for (Object[] row : appointmentRepository.countByStatus(today.minusMonths(1), today.plusDays(1))) {
            appointmentStats.put(String.valueOf(row[0]), (Long) row[1]);
        }

        Map<String, Long> insuranceClaims = new LinkedHashMap<>();
        for (Object[] row : claimRepository.countByStatus()) {
            insuranceClaims.put(String.valueOf(row[0]), (Long) row[1]);
        }

        Map<String, Long> patientStats = new LinkedHashMap<>();
        patientStats.put("total", patientRepository.count());
        patientStats.put("active", patientRepository.search(null, true, org.springframework.data.domain.Pageable.unpaged()).getTotalElements());

        return DashboardReportResponse.builder()
            .dailyRevenue(dailyRevenue).monthlyRevenue(monthlyRevenue)
            .doctorPerformance(List.of())
            .topServices(topServices).appointmentStats(appointmentStats)
            .insuranceClaims(insuranceClaims).patientStats(patientStats).build();
    }
}
`);

  j('modules/dashboard/controller/DashboardController.java', `package ${P}.modules.dashboard.controller;
import ${P}.modules.dashboard.dto.DashboardReportResponse;
import ${P}.modules.dashboard.service.DashboardService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/dashboard") @RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;
    @GetMapping("/reports") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<DashboardReportResponse>> reports() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.buildReport()));
    }
}
`);

  // ─── Settings ──────────────────────────────────────────────────────────────
  j('modules/settings/entity/ClinicSetting.java', `package ${P}.modules.settings.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "clinic_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClinicSetting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "setting_key", unique = true, nullable = false, length = 100) private String settingKey;
    @Column(name = "setting_value", columnDefinition = "TEXT") private String settingValue;
    @Column(length = 500) private String description;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/settings/repository/ClinicSettingRepository.java', `package ${P}.modules.settings.repository;
import ${P}.modules.settings.entity.ClinicSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClinicSettingRepository extends JpaRepository<ClinicSetting, Long> {
    Optional<ClinicSetting> findBySettingKey(String settingKey);
}
`);

  j('modules/settings/dto/ClinicSettingDto.java', `package ${P}.modules.settings.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ClinicSettingDto {
    private Long id;
    @NotBlank private String settingKey;
    private String settingValue;
    private String description;
}
`);

  j('modules/settings/service/SettingsService.java', `package ${P}.modules.settings.service;
import ${P}.modules.settings.dto.ClinicSettingDto;
import ${P}.modules.settings.entity.ClinicSetting;
import ${P}.modules.settings.repository.ClinicSettingRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class SettingsService {
    private final ClinicSettingRepository repository;

    public List<ClinicSettingDto> getAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public ClinicSettingDto getByKey(String key) {
        return toResponse(repository.findBySettingKey(key).orElseThrow(() -> AppException.notFound("Setting not found")));
    }

    @Transactional
    public ClinicSettingDto upsert(ClinicSettingDto dto) {
        ClinicSetting s = repository.findBySettingKey(dto.getSettingKey()).orElse(
            ClinicSetting.builder().settingKey(dto.getSettingKey()).build());
        s.setSettingValue(dto.getSettingValue());
        s.setDescription(dto.getDescription());
        return toResponse(repository.save(s));
    }

    public ClinicSettingDto toResponse(ClinicSetting s) {
        return ClinicSettingDto.builder().id(s.getId()).settingKey(s.getSettingKey())
            .settingValue(s.getSettingValue()).description(s.getDescription()).build();
    }
}
`);

  j('modules/settings/controller/SettingsController.java', `package ${P}.modules.settings.controller;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.modules.settings.dto.ClinicSettingDto;
import ${P}.modules.settings.service.SettingsService;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/settings") @RequiredArgsConstructor
public class SettingsController {
    private final SettingsService settingsService;
    @GetMapping @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<ClinicSettingDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getAll()));
    }
    @GetMapping("/{key}") @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<ClinicSettingDto>> getByKey(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getByKey(key)));
    }
    @PutMapping @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<ClinicSettingDto>> upsert(@Valid @RequestBody ClinicSettingDto request) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.upsert(request)));
    }
}
`);

  // ─── Audit ─────────────────────────────────────────────────────────────────
  j('modules/audit/entity/AuditLog.java', `package ${P}.modules.audit.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "audit_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id") private Long userId;
    @Column(nullable = false, length = 100) private String action;
    @Column(name = "entity_type", length = 100) private String entityType;
    @Column(name = "entity_id") private Long entityId;
    @Column(columnDefinition = "TEXT") private String details;
    @Column(name = "ip_address", length = 45) private String ipAddress;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
`);

  j('modules/audit/repository/AuditLogRepository.java', `package ${P}.modules.audit.repository;
import ${P}.modules.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
`);

  j('modules/audit/service/AuditLogService.java', `package ${P}.modules.audit.service;
import ${P}.modules.audit.entity.AuditLog;
import ${P}.modules.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository repository;

    public Page<AuditLog> list(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public AuditLog log(Long userId, String action, String entityType, Long entityId, String details, String ip) {
        return repository.save(AuditLog.builder().userId(userId).action(action).entityType(entityType)
            .entityId(entityId).details(details).ipAddress(ip).createdAt(java.time.LocalDateTime.now()).build());
    }
}
`);

  j('modules/audit/controller/AuditLogController.java', `package ${P}.modules.audit.controller;
import ${P}.modules.audit.entity.AuditLog;
import ${P}.modules.audit.service.AuditLogService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/audit-logs") @RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogService auditLogService;
    @GetMapping @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(auditLogService.list(pageable)));
    }
}
`);
};
