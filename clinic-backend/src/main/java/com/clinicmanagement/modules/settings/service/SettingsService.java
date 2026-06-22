package com.clinicmanagement.modules.settings.service;
import com.clinicmanagement.modules.settings.dto.ClinicSettingDto;
import com.clinicmanagement.modules.settings.entity.ClinicSetting;
import com.clinicmanagement.modules.settings.repository.ClinicSettingRepository;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor
public class SettingsService {
    private final ClinicSettingRepository repository;

    public List<ClinicSettingDto> getAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public ClinicSettingDto getByKey(String key) {
        return toResponse(repository.findBySettingKey(key).orElseThrow(() -> AppException.notFound("Setting not found")));
    }

    @Transactional
    public ClinicSettingDto upsert(ClinicSettingDto dto) {
        ClinicSetting s = repository.findBySettingKey(dto.getSettingKey()).orElse(
            ClinicSetting.builder().settingKey(dto.getSettingKey()).build());
        s.setSettingValue(dto.getSettingValue());
        s.setDescription(dto.getDescription());
        return toResponse(repository.save(s));
    }

    public ClinicSettingDto toResponse(ClinicSetting s) {
        return ClinicSettingDto.builder().id(s.getId()).settingKey(s.getSettingKey())
            .settingValue(s.getSettingValue()).description(s.getDescription()).build();
    }

    public String resolveValue(String key, String defaultValue) {
        return repository.findBySettingKey(key)
            .map(ClinicSetting::getSettingValue)
            .filter(v -> v != null && !v.isBlank())
            .orElse(defaultValue);
    }
}
