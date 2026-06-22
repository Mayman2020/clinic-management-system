package com.clinicmanagement.modules.prescription.entity;
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
