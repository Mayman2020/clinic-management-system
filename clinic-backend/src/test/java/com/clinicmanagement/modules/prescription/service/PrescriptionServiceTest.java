package com.clinicmanagement.modules.prescription.service;

import com.clinicmanagement.modules.doctors.entity.Doctor;
import com.clinicmanagement.modules.doctors.repository.DoctorRepository;
import com.clinicmanagement.modules.patients.entity.Patient;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.prescription.dto.PrescriptionResponse;
import com.clinicmanagement.modules.prescription.entity.Prescription;
import com.clinicmanagement.modules.prescription.repository.PrescriptionRepository;
import com.clinicmanagement.modules.settings.service.SettingsService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PrescriptionServiceTest {

    @Test
    void listByPatientReturnsPrescriptionsWithPatientAndDoctorNames() {
        PrescriptionRepository repository = mock(PrescriptionRepository.class);
        SettingsService settingsService = mock(SettingsService.class);
        PatientRepository patientRepository = mock(PatientRepository.class);
        DoctorRepository doctorRepository = mock(DoctorRepository.class);

        PrescriptionService service = new PrescriptionService(repository, settingsService, patientRepository, doctorRepository);

        Prescription prescription = Prescription.builder()
                .id(1L)
                .prescriptionNo("RX-001")
                .patientId(10L)
                .doctorId(20L)
                .status("ACTIVE")
                .build();

        when(repository.findByPatientIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(prescription));
        when(patientRepository.findById(10L)).thenReturn(Optional.of(Patient.builder().firstName("Ali").lastName("Sayed").build()));
        when(doctorRepository.findById(20L)).thenReturn(Optional.of(Doctor.builder().firstName("Mona").lastName("Hassan").build()));

        List<PrescriptionResponse> result = service.listByPatient(10L);

        assertEquals(1, result.size());
        assertEquals("Ali Sayed", result.get(0).getPatientName());
        assertEquals("Mona Hassan", result.get(0).getDoctorName());
    }
}
