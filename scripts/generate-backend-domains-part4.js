/**
 * Domain modules part 4: prescription through audit
 */
module.exports = function registerDomainModulesPart4(ctx) {
  const { j, P } = ctx;

  // ─── Prescription ──────────────────────────────────────────────────────────
  j('modules/prescription/entity/Prescription.java', `package ${P}.modules.prescription.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "prescriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Prescription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "prescription_no", unique = true, nullable = false, length = 30) private String prescriptionNo;
    @Column(name = "consultation_id") private Long consultationId;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(length = 20) private String status;
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<PrescriptionItem> items = new ArrayList<>();
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/prescription/entity/PrescriptionItem.java', `package ${P}.modules.prescription.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "prescription_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "prescription_id") private Prescription prescription;
    @Column(name = "medicine_name", nullable = false, length = 200) private String medicineName;
    @Column(length = 100) private String dosage;
    @Column(length = 100) private String frequency;
    @Column(length = 100) private String duration;
    @Column(columnDefinition = "TEXT") private String notes;
}
`);

  j('modules/prescription/repository/PrescriptionRepository.java', `package ${P}.modules.prescription.repository;
import ${P}.modules.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    @EntityGraph(attributePaths = "items")
    Optional<Prescription> findWithItemsById(Long id);
}
`);

  j('modules/prescription/dto/PrescriptionItemRequest.java', `package ${P}.modules.prescription.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrescriptionItemRequest {
    @NotBlank private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String notes;
}
`);

  j('modules/prescription/dto/PrescriptionRequest.java', `package ${P}.modules.prescription.dto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class PrescriptionRequest {
    private Long consultationId;
    @NotNull private Long patientId;
    @NotNull private Long doctorId;
    private String notes;
    @NotEmpty private List<PrescriptionItemRequest> items;
}
`);

  j('modules/prescription/dto/PrescriptionResponse.java', `package ${P}.modules.prescription.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class PrescriptionResponse {
    private Long id;
    private String prescriptionNo;
    private Long consultationId;
    private Long patientId;
    private Long doctorId;
    private String notes;
    private String status;
    private List<PrescriptionItemResponse> items;
    private LocalDateTime createdAt;
}
`);

  j('modules/prescription/dto/PrescriptionItemResponse.java', `package ${P}.modules.prescription.dto;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class PrescriptionItemResponse {
    private Long id;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String duration;
    private String notes;
}
`);

  j('modules/prescription/dto/PrescriptionPrintData.java', `package ${P}.modules.prescription.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class PrescriptionPrintData {
    private String prescriptionNo;
    private Long patientId;
    private Long doctorId;
    private String notes;
    private LocalDateTime issuedAt;
    private List<PrescriptionItemResponse> items;
    private String clinicName;
}
`);

  j('modules/prescription/service/PrescriptionService.java', `package ${P}.modules.prescription.service;
import ${P}.modules.prescription.dto.*;
import ${P}.modules.prescription.entity.*;
import ${P}.modules.prescription.repository.PrescriptionRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository repository;

    public PrescriptionResponse getById(Long id) {
        return toResponse(repository.findWithItemsById(id).orElseThrow(() -> AppException.notFound("Prescription not found")));
    }

    public PrescriptionPrintData getPrintData(Long id) {
        PrescriptionResponse r = getById(id);
        return PrescriptionPrintData.builder().prescriptionNo(r.getPrescriptionNo()).patientId(r.getPatientId())
            .doctorId(r.getDoctorId()).notes(r.getNotes()).issuedAt(r.getCreatedAt()).items(r.getItems())
            .clinicName("Clinic Management System").build();
    }

    @Transactional
    public PrescriptionResponse create(PrescriptionRequest request) {
        Prescription p = Prescription.builder().prescriptionNo("RX-" + String.format("%06d", repository.count() + 1))
            .consultationId(request.getConsultationId()).patientId(request.getPatientId())
            .doctorId(request.getDoctorId()).notes(request.getNotes()).status("ACTIVE").build();
        for (PrescriptionItemRequest ir : request.getItems()) {
            PrescriptionItem item = PrescriptionItem.builder().prescription(p).medicineName(ir.getMedicineName())
                .dosage(ir.getDosage()).frequency(ir.getFrequency()).duration(ir.getDuration()).notes(ir.getNotes()).build();
            p.getItems().add(item);
        }
        return toResponse(repository.save(p));
    }

    public PrescriptionResponse toResponse(Prescription p) {
        return PrescriptionResponse.builder().id(p.getId()).prescriptionNo(p.getPrescriptionNo())
            .consultationId(p.getConsultationId()).patientId(p.getPatientId()).doctorId(p.getDoctorId())
            .notes(p.getNotes()).status(p.getStatus()).createdAt(p.getCreatedAt())
            .items(p.getItems().stream().map(i -> PrescriptionItemResponse.builder().id(i.getId())
                .medicineName(i.getMedicineName()).dosage(i.getDosage()).frequency(i.getFrequency())
                .duration(i.getDuration()).notes(i.getNotes()).build()).toList()).build();
    }
}
`);

  j('modules/prescription/controller/PrescriptionController.java', `package ${P}.modules.prescription.controller;
import ${P}.modules.prescription.dto.*;
import ${P}.modules.prescription.service.PrescriptionService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/prescriptions") @RequiredArgsConstructor
public class PrescriptionController {
    private final PrescriptionService prescriptionService;
    @GetMapping("/{id}") @RequiresPermission(module = "prescription", action = "view")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getById(id)));
    }
    @GetMapping("/{id}/print") @RequiresPermission(module = "prescription", action = "export")
    public ResponseEntity<ApiResponse<PrescriptionPrintData>> print(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.getPrintData(id)));
    }
    @PostMapping @RequiresPermission(module = "prescription", action = "create")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> create(@Valid @RequestBody PrescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(prescriptionService.create(request)));
    }
}
`);

  // ─── Lab ───────────────────────────────────────────────────────────────────
  j('modules/lab/entity/LabStatus.java', `package ${P}.modules.lab.entity;
public enum LabStatus { REQUESTED, SAMPLE_COLLECTED, IN_PROGRESS, COMPLETED, CANCELLED }
`);

  j('modules/lab/entity/LabRequest.java', `package ${P}.modules.lab.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "lab_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LabRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "request_no", unique = true, nullable = false, length = 30) private String requestNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id") private Long doctorId;
    @Column(name = "test_type", nullable = false, length = 100) private String testType;
    @Column(name = "test_category", length = 50) private String testCategory;
    @Enumerated(EnumType.STRING) @Column(length = 30) private LabStatus status;
    @Column(name = "result_pdf_url", length = 500) private String resultPdfUrl;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "requested_at") private LocalDateTime requestedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/lab/repository/LabRequestRepository.java', `package ${P}.modules.lab.repository;
import ${P}.modules.lab.entity.LabRequest;
import ${P}.modules.lab.entity.LabStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabRequestRepository extends JpaRepository<LabRequest, Long> {
    List<LabRequest> findByPatientIdOrderByRequestedAtDesc(Long patientId);
    List<LabRequest> findByStatus(LabStatus status);
}
`);

  j('modules/lab/dto/LabRequestDto.java', `package ${P}.modules.lab.dto;
import ${P}.modules.lab.entity.LabStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class LabRequestDto {
    private Long id;
    private String requestNo;
    @NotNull private Long patientId;
    private Long doctorId;
    @NotBlank private String testType;
    private String testCategory;
    private LabStatus status;
    private String resultPdfUrl;
    private String notes;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
}
`);

  j('modules/lab/service/LabService.java', `package ${P}.modules.lab.service;
import ${P}.modules.lab.dto.LabRequestDto;
import ${P}.modules.lab.entity.*;
import ${P}.modules.lab.repository.LabRequestRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class LabService {
    private final LabRequestRepository repository;

    public LabRequestDto getById(Long id) { return toResponse(find(id)); }
    public List<LabRequestDto> byPatient(Long patientId) {
        return repository.findByPatientIdOrderByRequestedAtDesc(patientId).stream().map(this::toResponse).toList();
    }
    public List<LabRequestDto> byStatus(LabStatus status) {
        return repository.findByStatus(status).stream().map(this::toResponse).toList();
    }

    @Transactional
    public LabRequestDto create(LabRequestDto dto) {
        LabRequest r = LabRequest.builder().requestNo("LAB-" + String.format("%06d", repository.count() + 1))
            .patientId(dto.getPatientId()).doctorId(dto.getDoctorId()).testType(dto.getTestType())
            .testCategory(dto.getTestCategory()).status(LabStatus.REQUESTED).notes(dto.getNotes())
            .requestedAt(LocalDateTime.now()).build();
        return toResponse(repository.save(r));
    }

    @Transactional
    public LabRequestDto updateStatus(Long id, LabStatus status, String resultPdfUrl) {
        LabRequest r = find(id);
        r.setStatus(status);
        if (resultPdfUrl != null) r.setResultPdfUrl(resultPdfUrl);
        if (status == LabStatus.COMPLETED) r.setCompletedAt(LocalDateTime.now());
        return toResponse(repository.save(r));
    }

    private LabRequest find(Long id) { return repository.findById(id).orElseThrow(() -> AppException.notFound("Lab request not found")); }

    public LabRequestDto toResponse(LabRequest r) {
        return LabRequestDto.builder().id(r.getId()).requestNo(r.getRequestNo()).patientId(r.getPatientId())
            .doctorId(r.getDoctorId()).testType(r.getTestType()).testCategory(r.getTestCategory())
            .status(r.getStatus()).resultPdfUrl(r.getResultPdfUrl()).notes(r.getNotes())
            .requestedAt(r.getRequestedAt()).completedAt(r.getCompletedAt()).build();
    }
}
`);

  j('modules/lab/controller/LabController.java', `package ${P}.modules.lab.controller;
import ${P}.modules.lab.dto.LabRequestDto;
import ${P}.modules.lab.entity.LabStatus;
import ${P}.modules.lab.service.LabService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/lab") @RequiredArgsConstructor
public class LabController {
    private final LabService labService;
    @GetMapping("/{id}") @RequiresPermission(module = "lab", action = "view")
    public ResponseEntity<ApiResponse<LabRequestDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(labService.getById(id)));
    }
    @GetMapping("/patient/{patientId}") @RequiresPermission(module = "lab", action = "view")
    public ResponseEntity<ApiResponse<List<LabRequestDto>>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(labService.byPatient(patientId)));
    }
    @GetMapping("/status/{status}") @RequiresPermission(module = "lab", action = "view")
    public ResponseEntity<ApiResponse<List<LabRequestDto>>> byStatus(@PathVariable LabStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(labService.byStatus(status)));
    }
    @PostMapping @RequiresPermission(module = "lab", action = "create")
    public ResponseEntity<ApiResponse<LabRequestDto>> create(@Valid @RequestBody LabRequestDto request) {
        return ResponseEntity.ok(ApiResponse.ok(labService.create(request)));
    }
    @PatchMapping("/{id}/status") @RequiresPermission(module = "lab", action = "edit")
    public ResponseEntity<ApiResponse<LabRequestDto>> updateStatus(@PathVariable Long id,
            @RequestParam LabStatus status, @RequestParam(required = false) String resultPdfUrl) {
        return ResponseEntity.ok(ApiResponse.ok(labService.updateStatus(id, status, resultPdfUrl)));
    }
}
`);

  // ─── Radiology ─────────────────────────────────────────────────────────────
  j('modules/radiology/entity/RadiologyStatus.java', `package ${P}.modules.radiology.entity;
public enum RadiologyStatus { REQUESTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED }
`);

  j('modules/radiology/entity/RadiologyRequest.java', `package ${P}.modules.radiology.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity @Table(name = "radiology_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RadiologyRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "request_no", unique = true, nullable = false, length = 30) private String requestNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "doctor_id") private Long doctorId;
    @Column(name = "study_type", nullable = false, length = 100) private String studyType;
    @Enumerated(EnumType.STRING) @Column(length = 30) private RadiologyStatus status;
    @Column(name = "scheduled_at") private LocalDateTime scheduledAt;
    @Column(name = "report_text", columnDefinition = "TEXT") private String reportText;
    @Column(name = "image_url", length = 500) private String imageUrl;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/radiology/repository/RadiologyRequestRepository.java', `package ${P}.modules.radiology.repository;
import ${P}.modules.radiology.entity.RadiologyRequest;
import ${P}.modules.radiology.entity.RadiologyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RadiologyRequestRepository extends JpaRepository<RadiologyRequest, Long> {
    List<RadiologyRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<RadiologyRequest> findByStatus(RadiologyStatus status);
}
`);

  j('modules/radiology/dto/RadiologyRequestDto.java', `package ${P}.modules.radiology.dto;
import ${P}.modules.radiology.entity.RadiologyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class RadiologyRequestDto {
    private Long id;
    private String requestNo;
    @NotNull private Long patientId;
    private Long doctorId;
    @NotBlank private String studyType;
    private RadiologyStatus status;
    private LocalDateTime scheduledAt;
    private String reportText;
    private String imageUrl;
    private String notes;
    private LocalDateTime completedAt;
}
`);

  j('modules/radiology/service/RadiologyService.java', `package ${P}.modules.radiology.service;
import ${P}.modules.radiology.dto.RadiologyRequestDto;
import ${P}.modules.radiology.entity.*;
import ${P}.modules.radiology.repository.RadiologyRequestRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class RadiologyService {
    private final RadiologyRequestRepository repository;

    public RadiologyRequestDto getById(Long id) { return toResponse(find(id)); }
    public List<RadiologyRequestDto> byPatient(Long patientId) {
        return repository.findByPatientIdOrderByCreatedAtDesc(patientId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public RadiologyRequestDto create(RadiologyRequestDto dto) {
        RadiologyRequest r = RadiologyRequest.builder().requestNo("RAD-" + String.format("%06d", repository.count() + 1))
            .patientId(dto.getPatientId()).doctorId(dto.getDoctorId()).studyType(dto.getStudyType())
            .status(RadiologyStatus.REQUESTED).notes(dto.getNotes()).build();
        return toResponse(repository.save(r));
    }

    @Transactional
    public RadiologyRequestDto updateStatus(Long id, RadiologyStatus status, String reportText, String imageUrl) {
        RadiologyRequest r = find(id);
        r.setStatus(status);
        if (reportText != null) r.setReportText(reportText);
        if (imageUrl != null) r.setImageUrl(imageUrl);
        if (status == RadiologyStatus.COMPLETED) r.setCompletedAt(LocalDateTime.now());
        return toResponse(repository.save(r));
    }

    private RadiologyRequest find(Long id) { return repository.findById(id).orElseThrow(() -> AppException.notFound("Radiology request not found")); }

    public RadiologyRequestDto toResponse(RadiologyRequest r) {
        return RadiologyRequestDto.builder().id(r.getId()).requestNo(r.getRequestNo()).patientId(r.getPatientId())
            .doctorId(r.getDoctorId()).studyType(r.getStudyType()).status(r.getStatus())
            .scheduledAt(r.getScheduledAt()).reportText(r.getReportText()).imageUrl(r.getImageUrl())
            .notes(r.getNotes()).completedAt(r.getCompletedAt()).build();
    }
}
`);

  j('modules/radiology/controller/RadiologyController.java', `package ${P}.modules.radiology.controller;
import ${P}.modules.radiology.dto.RadiologyRequestDto;
import ${P}.modules.radiology.entity.RadiologyStatus;
import ${P}.modules.radiology.service.RadiologyService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/radiology") @RequiredArgsConstructor
public class RadiologyController {
    private final RadiologyService radiologyService;
    @GetMapping("/{id}") @RequiresPermission(module = "radiology", action = "view")
    public ResponseEntity<ApiResponse<RadiologyRequestDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.getById(id)));
    }
    @GetMapping("/patient/{patientId}") @RequiresPermission(module = "radiology", action = "view")
    public ResponseEntity<ApiResponse<List<RadiologyRequestDto>>> byPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.byPatient(patientId)));
    }
    @PostMapping @RequiresPermission(module = "radiology", action = "create")
    public ResponseEntity<ApiResponse<RadiologyRequestDto>> create(@Valid @RequestBody RadiologyRequestDto request) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.create(request)));
    }
    @PatchMapping("/{id}/status") @RequiresPermission(module = "radiology", action = "edit")
    public ResponseEntity<ApiResponse<RadiologyRequestDto>> updateStatus(@PathVariable Long id,
            @RequestParam RadiologyStatus status,
            @RequestParam(required = false) String reportText,
            @RequestParam(required = false) String imageUrl) {
        return ResponseEntity.ok(ApiResponse.ok(radiologyService.updateStatus(id, status, reportText, imageUrl)));
    }
}
`);

  // ─── Billing ───────────────────────────────────────────────────────────────
  j('modules/billing/entity/Invoice.java', `package ${P}.modules.billing.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "invoice_no", unique = true, nullable = false, length = 30) private String invoiceNo;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(length = 20) private String status;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    @Column(name = "paid_amount") private BigDecimal paidAmount;
    @Column(columnDefinition = "TEXT") private String notes;
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<InvoiceItem> items = new ArrayList<>();
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<Payment> payments = new ArrayList<>();
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/billing/entity/InvoiceItem.java', `package ${P}.modules.billing.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "invoice_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "invoice_id") private Invoice invoice;
    @Column(name = "item_type", nullable = false, length = 50) private String itemType;
    @Column(nullable = false, length = 300) private String description;
    private BigDecimal quantity;
    @Column(name = "unit_price", nullable = false) private BigDecimal unitPrice;
    @Column(name = "total_price", nullable = false) private BigDecimal totalPrice;
    @Column(name = "reference_id") private Long referenceId;
}
`);

  j('modules/billing/entity/Payment.java', `package ${P}.modules.billing.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "invoice_id") private Invoice invoice;
    @Column(nullable = false) private BigDecimal amount;
    @Column(name = "payment_method", nullable = false, length = 30) private String paymentMethod;
    @Column(name = "reference_no", length = 100) private String referenceNo;
    @Column(name = "paid_at") private LocalDateTime paidAt;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "created_by") private Long createdBy;
}
`);

  j('modules/billing/repository/InvoiceRepository.java', `package ${P}.modules.billing.repository;
import ${P}.modules.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    @EntityGraph(attributePaths = {"items", "payments"})
    Optional<Invoice> findWithDetailsById(Long id);
    @Query("SELECT COALESCE(SUM(i.paidAmount), 0) FROM Invoice i WHERE i.createdAt BETWEEN :from AND :to")
    BigDecimal sumPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
    @Query("SELECT ii.itemType, SUM(ii.totalPrice) FROM InvoiceItem ii GROUP BY ii.itemType ORDER BY SUM(ii.totalPrice) DESC")
    List<Object[]> topServices();
}
`);

  j('modules/billing/dto/InvoiceItemRequest.java', `package ${P}.modules.billing.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvoiceItemRequest {
    @NotBlank private String itemType;
    @NotBlank private String description;
    private BigDecimal quantity;
    @NotNull private BigDecimal unitPrice;
    private Long referenceId;
}
`);

  j('modules/billing/dto/PaymentRequest.java', `package ${P}.modules.billing.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull private BigDecimal amount;
    @NotBlank private String paymentMethod;
    private String referenceNo;
    private String notes;
}
`);

  j('modules/billing/dto/MixedPaymentRequest.java', `package ${P}.modules.billing.dto;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class MixedPaymentRequest {
    @NotEmpty private List<PaymentRequest> payments;
}
`);

  j('modules/billing/dto/InvoiceRequest.java', `package ${P}.modules.billing.dto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class InvoiceRequest {
    @NotNull private Long patientId;
    private BigDecimal discount;
    private BigDecimal tax;
    private String notes;
    @NotEmpty private List<InvoiceItemRequest> items;
}
`);

  j('modules/billing/dto/InvoiceResponse.java', `package ${P}.modules.billing.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class InvoiceResponse {
    private Long id;
    private String invoiceNo;
    private Long patientId;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private BigDecimal paidAmount;
    private String notes;
    private List<InvoiceItemResponse> items;
    private List<PaymentResponse> payments;
    private LocalDateTime createdAt;
}
`);

  j('modules/billing/dto/InvoiceItemResponse.java', `package ${P}.modules.billing.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class InvoiceItemResponse {
    private Long id;
    private String itemType;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Long referenceId;
}
`);

  j('modules/billing/dto/PaymentResponse.java', `package ${P}.modules.billing.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class PaymentResponse {
    private Long id;
    private BigDecimal amount;
    private String paymentMethod;
    private String referenceNo;
    private LocalDateTime paidAt;
    private String notes;
}
`);

  j('modules/billing/service/BillingService.java', `package ${P}.modules.billing.service;
import ${P}.modules.billing.dto.*;
import ${P}.modules.billing.entity.*;
import ${P}.modules.billing.repository.InvoiceRepository;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class BillingService {
    private final InvoiceRepository invoiceRepository;

    public InvoiceResponse getById(Long id) {
        return toResponse(invoiceRepository.findWithDetailsById(id).orElseThrow(() -> AppException.notFound("Invoice not found")));
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        Invoice invoice = Invoice.builder().invoiceNo("INV-" + String.format("%06d", invoiceRepository.count() + 1))
            .patientId(request.getPatientId()).status("PENDING")
            .discount(nz(request.getDiscount())).tax(nz(request.getTax()))
            .paidAmount(BigDecimal.ZERO).notes(request.getNotes()).build();
        for (InvoiceItemRequest ir : request.getItems()) {
            BigDecimal qty = ir.getQuantity() == null ? BigDecimal.ONE : ir.getQuantity();
            BigDecimal lineTotal = ir.getUnitPrice().multiply(qty);
            subtotal = subtotal.add(lineTotal);
            InvoiceItem item = InvoiceItem.builder().invoice(invoice).itemType(ir.getItemType())
                .description(ir.getDescription()).quantity(qty).unitPrice(ir.getUnitPrice())
                .totalPrice(lineTotal).referenceId(ir.getReferenceId()).build();
            invoice.getItems().add(item);
        }
        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal.subtract(invoice.getDiscount()).add(invoice.getTax()));
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse addMixedPayment(Long invoiceId, MixedPaymentRequest request, Long userId) {
        Invoice invoice = invoiceRepository.findWithDetailsById(invoiceId).orElseThrow(() -> AppException.notFound("Invoice not found"));
        BigDecimal paid = invoice.getPaidAmount() == null ? BigDecimal.ZERO : invoice.getPaidAmount();
        for (PaymentRequest pr : request.getPayments()) {
            Payment payment = Payment.builder().invoice(invoice).amount(pr.getAmount())
                .paymentMethod(pr.getPaymentMethod()).referenceNo(pr.getReferenceNo())
                .paidAt(LocalDateTime.now()).notes(pr.getNotes()).createdBy(userId).build();
            invoice.getPayments().add(payment);
            paid = paid.add(pr.getAmount());
        }
        invoice.setPaidAmount(paid);
        if (paid.compareTo(invoice.getTotal()) >= 0) invoice.setStatus("PAID");
        else if (paid.compareTo(BigDecimal.ZERO) > 0) invoice.setStatus("PARTIAL");
        return toResponse(invoiceRepository.save(invoice));
    }

    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    public InvoiceResponse toResponse(Invoice i) {
        return InvoiceResponse.builder().id(i.getId()).invoiceNo(i.getInvoiceNo()).patientId(i.getPatientId())
            .status(i.getStatus()).subtotal(i.getSubtotal()).discount(i.getDiscount()).tax(i.getTax())
            .total(i.getTotal()).paidAmount(i.getPaidAmount()).notes(i.getNotes()).createdAt(i.getCreatedAt())
            .items(i.getItems().stream().map(it -> InvoiceItemResponse.builder().id(it.getId())
                .itemType(it.getItemType()).description(it.getDescription()).quantity(it.getQuantity())
                .unitPrice(it.getUnitPrice()).totalPrice(it.getTotalPrice()).referenceId(it.getReferenceId()).build()).toList())
            .payments(i.getPayments().stream().map(p -> PaymentResponse.builder().id(p.getId()).amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod()).referenceNo(p.getReferenceNo())
                .paidAt(p.getPaidAt()).notes(p.getNotes()).build()).toList()).build();
    }
}
`);

  j('modules/billing/controller/BillingController.java', `package ${P}.modules.billing.controller;
import ${P}.modules.billing.dto.*;
import ${P}.modules.billing.service.BillingService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.modules.user.entity.User;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/billing") @RequiredArgsConstructor
public class BillingController {
    private final BillingService billingService;
    @GetMapping("/invoices/{id}") @RequiresPermission(module = "billing", action = "view")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.getById(id)));
    }
    @PostMapping("/invoices") @RequiresPermission(module = "billing", action = "create")
    public ResponseEntity<ApiResponse<InvoiceResponse>> create(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(billingService.create(request)));
    }
    @PostMapping("/invoices/{id}/payments/mixed") @RequiresPermission(module = "billing", action = "approve")
    public ResponseEntity<ApiResponse<InvoiceResponse>> mixedPayment(@PathVariable Long id, @Valid @RequestBody MixedPaymentRequest request) {
        Long userId = null;
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (p instanceof User u) userId = u.getId();
        return ResponseEntity.ok(ApiResponse.ok(billingService.addMixedPayment(id, request, userId)));
    }
}
`);

  // Part 5: insurance, dashboard, settings, audit
  require('./generate-backend-domains-part5')(ctx);
};
