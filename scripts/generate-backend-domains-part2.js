/**
 * Domain modules part 2: patients through audit
 */
module.exports = function registerDomainModules(ctx) {
  const { j, P, write, RES } = ctx;

  // ─── Patients ──────────────────────────────────────────────────────────────
  j('modules/patients/entity/Patient.java', `package ${P}.modules.patients.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "patients") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "patient_code", unique = true, nullable = false, length = 30) private String patientCode;
    @Column(name = "first_name", nullable = false, length = 100) private String firstName;
    @Column(name = "last_name", nullable = false, length = 100) private String lastName;
    @Column(name = "national_id", length = 50) private String nationalId;
    @Column(name = "passport_number", length = 50) private String passportNumber;
    @Column(name = "date_of_birth") private LocalDate dateOfBirth;
    @Column(length = 10) private String gender;
    @Column(length = 20) private String phone;
    @Column(length = 150) private String email;
    @Column(columnDefinition = "TEXT") private String address;
    @Column(name = "emergency_contact_name", length = 150) private String emergencyContactName;
    @Column(name = "emergency_contact_phone", length = 20) private String emergencyContactPhone;
    @Column(name = "medical_history", columnDefinition = "TEXT") private String medicalHistory;
    @Column(columnDefinition = "TEXT") private String allergies;
    @Column(name = "chronic_diseases", columnDefinition = "TEXT") private String chronicDiseases;
    @Column(name = "insurance_provider_id") private Long insuranceProviderId;
    @Column(name = "insurance_policy_no", length = 100) private String insurancePolicyNo;
    @Column(columnDefinition = "TEXT") private String notes;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedBy @Column(name = "created_by", updatable = false) private Long createdBy;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/patients/entity/PatientDocument.java', `package ${P}.modules.patients.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "patient_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "patient_id", nullable = false) private Long patientId;
    @Column(name = "file_name", nullable = false, length = 255) private String fileName;
    @Column(name = "file_url", nullable = false, length = 500) private String fileUrl;
    @Column(name = "document_type", length = 50) private String documentType;
    @Column(name = "uploaded_at") private LocalDateTime uploadedAt;
}
`);

  j('modules/patients/repository/PatientRepository.java', `package ${P}.modules.patients.repository;
import ${P}.modules.patients.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientCode(String patientCode);
    boolean existsByNationalIdAndActiveTrueAndIdNot(String nationalId, Long id);
    boolean existsByNationalIdAndActiveTrue(String nationalId);
    @Query("SELECT p FROM Patient p WHERE p.active = COALESCE(:active, p.active) AND (:q IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.lastName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.patientCode) LIKE LOWER(CONCAT('%',:q,'%')) OR p.nationalId LIKE CONCAT('%',:q,'%'))")
    Page<Patient> search(@Param("q") String q, @Param("active") Boolean active, Pageable pageable);
}
`);

  j('modules/patients/repository/PatientDocumentRepository.java', `package ${P}.modules.patients.repository;
import ${P}.modules.patients.entity.PatientDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientDocumentRepository extends JpaRepository<PatientDocument, Long> {
    List<PatientDocument> findByPatientIdOrderByUploadedAtDesc(Long patientId);
}
`);

  j('modules/patients/dto/PatientRequest.java', `package ${P}.modules.patients.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String nationalId;
    private String passportNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String medicalHistory;
    private String allergies;
    private String chronicDiseases;
    private Long insuranceProviderId;
    private String insurancePolicyNo;
    private String notes;
}
`);

  j('modules/patients/dto/PatientResponse.java', `package ${P}.modules.patients.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class PatientResponse {
    private Long id;
    private String patientCode;
    private String firstName;
    private String lastName;
    private String nationalId;
    private String passportNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String medicalHistory;
    private String allergies;
    private String chronicDiseases;
    private Long insuranceProviderId;
    private String insurancePolicyNo;
    private String notes;
    private boolean active;
    private LocalDateTime createdAt;
}
`);

  j('modules/patients/dto/PatientDocumentRequest.java', `package ${P}.modules.patients.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientDocumentRequest {
    @NotNull private Long patientId;
    @NotBlank private String fileName;
    @NotBlank private String fileUrl;
    private String documentType;
}
`);

  j('modules/patients/dto/PatientDocumentResponse.java', `package ${P}.modules.patients.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class PatientDocumentResponse {
    private Long id;
    private Long patientId;
    private String fileName;
    private String fileUrl;
    private String documentType;
    private LocalDateTime uploadedAt;
}
`);

  j('modules/patients/mapper/PatientMapper.java', `package ${P}.modules.patients.mapper;
import ${P}.modules.patients.dto.*;
import ${P}.modules.patients.entity.*;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class PatientMapper {
    public PatientResponse toResponse(Patient p) {
        return PatientResponse.builder().id(p.getId()).patientCode(p.getPatientCode())
            .firstName(p.getFirstName()).lastName(p.getLastName()).nationalId(p.getNationalId())
            .passportNumber(p.getPassportNumber()).dateOfBirth(p.getDateOfBirth()).gender(p.getGender())
            .phone(p.getPhone()).email(p.getEmail()).address(p.getAddress())
            .emergencyContactName(p.getEmergencyContactName()).emergencyContactPhone(p.getEmergencyContactPhone())
            .medicalHistory(p.getMedicalHistory()).allergies(p.getAllergies())
            .chronicDiseases(p.getChronicDiseases()).insuranceProviderId(p.getInsuranceProviderId())
            .insurancePolicyNo(p.getInsurancePolicyNo()).notes(p.getNotes()).active(p.isActive())
            .createdAt(p.getCreatedAt()).build();
    }
    public PatientDocumentResponse toResponse(PatientDocument d) {
        return PatientDocumentResponse.builder().id(d.getId()).patientId(d.getPatientId())
            .fileName(d.getFileName()).fileUrl(d.getFileUrl()).documentType(d.getDocumentType())
            .uploadedAt(d.getUploadedAt()).build();
    }
    public void apply(PatientRequest req, Patient p) {
        p.setFirstName(req.getFirstName()); p.setLastName(req.getLastName());
        p.setNationalId(req.getNationalId()); p.setPassportNumber(req.getPassportNumber());
        p.setDateOfBirth(req.getDateOfBirth()); p.setGender(req.getGender());
        p.setPhone(req.getPhone()); p.setEmail(req.getEmail()); p.setAddress(req.getAddress());
        p.setEmergencyContactName(req.getEmergencyContactName()); p.setEmergencyContactPhone(req.getEmergencyContactPhone());
        p.setMedicalHistory(req.getMedicalHistory()); p.setAllergies(req.getAllergies());
        p.setChronicDiseases(req.getChronicDiseases()); p.setInsuranceProviderId(req.getInsuranceProviderId());
        p.setInsurancePolicyNo(req.getInsurancePolicyNo()); p.setNotes(req.getNotes());
    }
}
`);

  j('modules/patients/service/PatientService.java', `package ${P}.modules.patients.service;
import ${P}.modules.patients.dto.*;
import ${P}.modules.patients.entity.*;
import ${P}.modules.patients.mapper.PatientMapper;
import ${P}.modules.patients.repository.*;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class PatientService {
    private final PatientRepository patientRepository;
    private final PatientDocumentRepository documentRepository;
    private final PatientMapper mapper;

    public Page<PatientResponse> search(String q, Boolean active, Pageable pageable) {
        return patientRepository.search(trim(q), active, pageable).map(mapper::toResponse);
    }
    public PatientResponse getById(Long id) { return mapper.toResponse(find(id)); }

    @Transactional
    public PatientResponse create(PatientRequest request) {
        checkDuplicateNationalId(request.getNationalId(), null);
        Patient p = Patient.builder().patientCode(generateCode()).active(true).build();
        mapper.apply(request, p);
        return mapper.toResponse(patientRepository.save(p));
    }

    @Transactional
    public PatientResponse update(Long id, PatientRequest request) {
        Patient p = find(id);
        checkDuplicateNationalId(request.getNationalId(), id);
        mapper.apply(request, p);
        return mapper.toResponse(patientRepository.save(p));
    }

    @Transactional
    public void archive(Long id) { Patient p = find(id); p.setActive(false); patientRepository.save(p); }

    @Transactional
    public PatientDocumentResponse addDocument(PatientDocumentRequest request) {
        find(request.getPatientId());
        PatientDocument doc = PatientDocument.builder().patientId(request.getPatientId())
            .fileName(request.getFileName()).fileUrl(request.getFileUrl())
            .documentType(request.getDocumentType()).uploadedAt(LocalDateTime.now()).build();
        return mapper.toResponse(documentRepository.save(doc));
    }

    public java.util.List<PatientDocumentResponse> listDocuments(Long patientId) {
        find(patientId);
        return documentRepository.findByPatientIdOrderByUploadedAtDesc(patientId).stream().map(mapper::toResponse).toList();
    }

    private Patient find(Long id) { return patientRepository.findById(id).orElseThrow(() -> AppException.notFound("Patient not found")); }
    private void checkDuplicateNationalId(String nationalId, Long excludeId) {
        if (nationalId == null || nationalId.isBlank()) return;
        boolean dup = excludeId == null ? patientRepository.existsByNationalIdAndActiveTrue(nationalId.trim())
            : patientRepository.existsByNationalIdAndActiveTrueAndIdNot(nationalId.trim(), excludeId);
        if (dup) throw AppException.conflict("Patient with this national ID already exists", "NATIONAL_ID_ALREADY_USED");
    }
    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }
    private String generateCode() { return "PAT-" + String.format("%06d", patientRepository.count() + 1); }
}
`);

  j('modules/patients/controller/PatientController.java', `package ${P}.modules.patients.controller;
import ${P}.modules.patients.dto.*;
import ${P}.modules.patients.service.PatientService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/patients") @RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;
    @GetMapping @RequiresPermission(module = "patients", action = "view")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> search(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.search(q, active, pageable)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "patients", action = "view")
    public ResponseEntity<ApiResponse<PatientResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getById(id)));
    }
    @PostMapping @RequiresPermission(module = "patients", action = "create")
    public ResponseEntity<ApiResponse<PatientResponse>> create(@Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.create(request)));
    }
    @PutMapping("/{id}") @RequiresPermission(module = "patients", action = "edit")
    public ResponseEntity<ApiResponse<PatientResponse>> update(@PathVariable Long id, @Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.update(id, request)));
    }
    @PostMapping("/{id}/archive") @RequiresPermission(module = "patients", action = "delete")
    public ResponseEntity<ApiResponse<Void>> archive(@PathVariable Long id) {
        patientService.archive(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
    @GetMapping("/{id}/documents") @RequiresPermission(module = "patients", action = "view")
    public ResponseEntity<ApiResponse<List<PatientDocumentResponse>>> listDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listDocuments(id)));
    }
    @PostMapping("/documents") @RequiresPermission(module = "patients", action = "edit")
    public ResponseEntity<ApiResponse<PatientDocumentResponse>> addDocument(@Valid @RequestBody PatientDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.addDocument(request)));
    }
}
`);

  // ─── Doctors ───────────────────────────────────────────────────────────────
  j('modules/doctors/entity/Specialty.java', `package ${P}.modules.doctors.entity;
public enum Specialty {
    GENERAL_MEDICINE, PEDIATRICS, DENTAL, DERMATOLOGY, CARDIOLOGY, ORTHOPEDICS,
    OPHTHALMOLOGY, ENT, GYNECOLOGY, NEUROLOGY, PSYCHIATRY, UROLOGY, OTHER
}
`);

  j('modules/doctors/entity/Doctor.java', `package ${P}.modules.doctors.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "doctors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id") private Long userId;
    @Column(name = "doctor_code", unique = true, nullable = false, length = 30) private String doctorCode;
    @Column(name = "first_name", nullable = false, length = 100) private String firstName;
    @Column(name = "last_name", nullable = false, length = 100) private String lastName;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 50) private Specialty specialty;
    @Column(length = 100) private String department;
    @Column(length = 20) private String phone;
    @Column(length = 150) private String email;
    @Column(name = "consultation_fee") private BigDecimal consultationFee;
    @Column(columnDefinition = "TEXT") private String bio;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}
`);

  j('modules/doctors/entity/DoctorSchedule.java', `package ${P}.modules.doctors.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity @Table(name = "doctor_schedules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DoctorSchedule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "doctor_id", nullable = false) private Long doctorId;
    @Column(name = "day_of_week", nullable = false) private Short dayOfWeek;
    @Column(name = "start_time", nullable = false) private LocalTime startTime;
    @Column(name = "end_time", nullable = false) private LocalTime endTime;
    @Builder.Default @Column(name = "is_active") private boolean active = true;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
}
`);

  j('modules/doctors/repository/DoctorRepository.java', `package ${P}.modules.doctors.repository;
import ${P}.modules.doctors.entity.Doctor;
import ${P}.modules.doctors.entity.Specialty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    @Query("SELECT d FROM Doctor d WHERE (:active IS NULL OR d.active = :active) AND (:specialty IS NULL OR d.specialty = :specialty) AND (:q IS NULL OR LOWER(d.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(d.lastName) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Doctor> search(@Param("q") String q, @Param("specialty") Specialty specialty, @Param("active") Boolean active, Pageable pageable);
    List<Doctor> findByActiveTrue();
}
`);

  j('modules/doctors/repository/DoctorScheduleRepository.java', `package ${P}.modules.doctors.repository;
import ${P}.modules.doctors.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctorIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(Long doctorId);
}
`);

  j('modules/doctors/dto/DoctorRequest.java', `package ${P}.modules.doctors.dto;
import ${P}.modules.doctors.entity.Specialty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DoctorRequest {
    private Long userId;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotNull private Specialty specialty;
    private String department;
    private String phone;
    private String email;
    private BigDecimal consultationFee;
    private String bio;
    private Boolean active;
}
`);

  j('modules/doctors/dto/DoctorResponse.java', `package ${P}.modules.doctors.dto;
import ${P}.modules.doctors.entity.Specialty;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class DoctorResponse {
    private Long id;
    private Long userId;
    private String doctorCode;
    private String firstName;
    private String lastName;
    private Specialty specialty;
    private String department;
    private String phone;
    private String email;
    private BigDecimal consultationFee;
    private String bio;
    private boolean active;
    private List<DoctorScheduleResponse> schedules;
    private LocalDateTime createdAt;
}
`);

  j('modules/doctors/dto/DoctorScheduleRequest.java', `package ${P}.modules.doctors.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class DoctorScheduleRequest {
    @NotNull private Short dayOfWeek;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
    private Boolean active;
}
`);

  j('modules/doctors/dto/DoctorScheduleResponse.java', `package ${P}.modules.doctors.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;

@Data @Builder
public class DoctorScheduleResponse {
    private Long id;
    private Long doctorId;
    private Short dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;
}
`);

  j('modules/doctors/service/DoctorService.java', `package ${P}.modules.doctors.service;
import ${P}.modules.doctors.dto.*;
import ${P}.modules.doctors.entity.*;
import ${P}.modules.doctors.repository.*;
import ${P}.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository scheduleRepository;

    public Page<DoctorResponse> search(String q, Specialty specialty, Boolean active, Pageable pageable) {
        return doctorRepository.search(trim(q), specialty, active, pageable).map(this::toResponse);
    }
    public DoctorResponse getById(Long id) { return toResponse(find(id)); }
    public List<DoctorResponse> listActive() { return doctorRepository.findByActiveTrue().stream().map(this::toResponse).toList(); }

    @Transactional
    public DoctorResponse create(DoctorRequest request) {
        Doctor d = Doctor.builder().doctorCode("DOC-" + String.format("%03d", doctorRepository.count() + 1))
            .userId(request.getUserId()).firstName(request.getFirstName()).lastName(request.getLastName())
            .specialty(request.getSpecialty()).department(request.getDepartment()).phone(request.getPhone())
            .email(request.getEmail()).consultationFee(request.getConsultationFee()).bio(request.getBio())
            .active(request.getActive() == null || request.getActive()).build();
        return toResponse(doctorRepository.save(d));
    }

    @Transactional
    public DoctorResponse update(Long id, DoctorRequest request) {
        Doctor d = find(id);
        d.setUserId(request.getUserId()); d.setFirstName(request.getFirstName()); d.setLastName(request.getLastName());
        d.setSpecialty(request.getSpecialty()); d.setDepartment(request.getDepartment());
        d.setPhone(request.getPhone()); d.setEmail(request.getEmail());
        d.setConsultationFee(request.getConsultationFee()); d.setBio(request.getBio());
        if (request.getActive() != null) d.setActive(request.getActive());
        return toResponse(doctorRepository.save(d));
    }

    @Transactional
    public DoctorScheduleResponse addSchedule(Long doctorId, DoctorScheduleRequest request) {
        find(doctorId);
        DoctorSchedule s = DoctorSchedule.builder().doctorId(doctorId).dayOfWeek(request.getDayOfWeek())
            .startTime(request.getStartTime()).endTime(request.getEndTime())
            .active(request.getActive() == null || request.getActive()).build();
        return toScheduleResponse(scheduleRepository.save(s));
    }

    public List<DoctorScheduleResponse> listSchedules(Long doctorId) {
        return scheduleRepository.findByDoctorIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(doctorId)
            .stream().map(this::toScheduleResponse).toList();
    }

    private Doctor find(Long id) { return doctorRepository.findById(id).orElseThrow(() -> AppException.notFound("Doctor not found")); }
    private static String trim(String q) { return q == null || q.isBlank() ? null : q.trim(); }

    public DoctorResponse toResponse(Doctor d) {
        return DoctorResponse.builder().id(d.getId()).userId(d.getUserId()).doctorCode(d.getDoctorCode())
            .firstName(d.getFirstName()).lastName(d.getLastName()).specialty(d.getSpecialty())
            .department(d.getDepartment()).phone(d.getPhone()).email(d.getEmail())
            .consultationFee(d.getConsultationFee()).bio(d.getBio()).active(d.isActive())
            .schedules(listSchedules(d.getId())).createdAt(d.getCreatedAt()).build();
    }

    private DoctorScheduleResponse toScheduleResponse(DoctorSchedule s) {
        return DoctorScheduleResponse.builder().id(s.getId()).doctorId(s.getDoctorId())
            .dayOfWeek(s.getDayOfWeek()).startTime(s.getStartTime()).endTime(s.getEndTime()).active(s.isActive()).build();
    }
}
`);

  j('modules/doctors/controller/DoctorController.java', `package ${P}.modules.doctors.controller;
import ${P}.modules.doctors.dto.*;
import ${P}.modules.doctors.entity.Specialty;
import ${P}.modules.doctors.service.DoctorService;
import ${P}.modules.permission.annotation.RequiresPermission;
import ${P}.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/doctors") @RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;
    @GetMapping @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> search(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) Specialty specialty,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.search(q, specialty, active, pageable)));
    }
    @GetMapping("/active") @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> listActive() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listActive()));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<DoctorResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getById(id)));
    }
    @PostMapping @RequiresPermission(module = "doctors", action = "create")
    public ResponseEntity<ApiResponse<DoctorResponse>> create(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.create(request)));
    }
    @PutMapping("/{id}") @RequiresPermission(module = "doctors", action = "edit")
    public ResponseEntity<ApiResponse<DoctorResponse>> update(@PathVariable Long id, @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.update(id, request)));
    }
    @PostMapping("/{id}/schedules") @RequiresPermission(module = "doctors", action = "edit")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> addSchedule(@PathVariable Long id, @Valid @RequestBody DoctorScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.addSchedule(id, request)));
    }
    @GetMapping("/{id}/schedules") @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> listSchedules(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listSchedules(id)));
    }
}
`);

  // Remaining modules in part 3
  require('./generate-backend-domains-part3')(ctx);

  // Settings migration
  write('clinic-backend/src/main/resources/db/migration/V5__clinic_settings.sql', `-- V5: Clinic settings key-value store
SET search_path TO clinic_mgmt;
CREATE TABLE IF NOT EXISTS clinic_settings (
    id              BIGSERIAL PRIMARY KEY,
    setting_key     VARCHAR(100) UNIQUE NOT NULL,
    setting_value   TEXT,
    description     VARCHAR(500),
    updated_at      TIMESTAMP DEFAULT NOW()
);
`);
};
