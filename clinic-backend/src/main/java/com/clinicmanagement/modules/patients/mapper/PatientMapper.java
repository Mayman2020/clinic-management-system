package com.clinicmanagement.modules.patients.mapper;
import com.clinicmanagement.modules.patients.dto.*;
import com.clinicmanagement.modules.patients.entity.*;
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
