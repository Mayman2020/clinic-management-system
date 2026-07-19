package com.clinicmanagement.modules.patients.dto;
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
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
