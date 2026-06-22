package com.clinicmanagement.modules.settings.repository;
import com.clinicmanagement.modules.settings.entity.ClinicSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClinicSettingRepository extends JpaRepository<ClinicSetting, Long> {
    Optional<ClinicSetting> findBySettingKey(String settingKey);
}
