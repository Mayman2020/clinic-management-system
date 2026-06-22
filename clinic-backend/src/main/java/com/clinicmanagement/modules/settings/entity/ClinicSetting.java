package com.clinicmanagement.modules.settings.entity;
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
