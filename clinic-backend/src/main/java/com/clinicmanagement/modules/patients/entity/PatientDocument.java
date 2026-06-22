package com.clinicmanagement.modules.patients.entity;
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
