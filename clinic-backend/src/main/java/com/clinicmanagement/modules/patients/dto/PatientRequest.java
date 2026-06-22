package com.clinicmanagement.modules.patients.dto;
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
