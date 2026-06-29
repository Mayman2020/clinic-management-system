package com.clinicmanagement.modules.lookup.service;

import com.clinicmanagement.modules.lookup.dto.CreateLookupRequestDTO;
import com.clinicmanagement.modules.lookup.dto.LookupResponseDTO;
import com.clinicmanagement.modules.lookup.dto.UpdateLookupRequestDTO;
import com.clinicmanagement.modules.lookup.entity.Lookup;
import com.clinicmanagement.modules.lookup.entity.LookupType;
import com.clinicmanagement.modules.lookup.repository.LookupRepository;
import com.clinicmanagement.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LookupService {
    private final LookupRepository lookupRepository;

    public List<LookupResponseDTO> getByType(LookupType type) {
        return lookupRepository.findByTypeAndActiveTrueOrderBySortOrderAscNameEnAsc(type)
            .stream().map(this::toResponse).toList();
    }

    public List<LookupResponseDTO> getAllByType(LookupType type) {
        return lookupRepository.findByTypeOrderBySortOrderAscNameEnAsc(type)
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public LookupResponseDTO create(CreateLookupRequestDTO request) {
        LookupType type = request.getType();
        String code = request.getCode() != null && !request.getCode().isBlank()
            ? normalizeCode(request.getCode()) : generateCode(type);
        if (lookupRepository.existsByTypeAndCodeIgnoreCase(type, code)) {
            throw AppException.conflict("Code already exists: " + code);
        }
        Lookup item = Lookup.builder()
            .type(type).code(code)
            .nameAr(request.getNameAr().trim()).nameEn(request.getNameEn().trim())
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
            .active(true).locked(false).build();
        return toResponse(lookupRepository.save(item));
    }

    @Transactional
    public LookupResponseDTO update(Long id, UpdateLookupRequestDTO request) {
        Lookup item = lookupRepository.findById(id)
            .orElseThrow(() -> AppException.notFound("Lookup not found: " + id));
        if (!item.isLocked()) {
            String code = normalizeCode(request.getCode());
            if (!code.equals(item.getCode()) && lookupRepository.existsByTypeAndCodeIgnoreCase(item.getType(), code)) {
                throw AppException.conflict("Code already exists: " + code);
            }
            item.setCode(code);
        }
        item.setNameAr(request.getNameAr().trim());
        item.setNameEn(request.getNameEn().trim());
        item.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        item.setActive(request.isActive());
        return toResponse(lookupRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        Lookup item = lookupRepository.findById(id)
            .orElseThrow(() -> AppException.notFound("Lookup not found: " + id));
        if (item.isLocked()) throw AppException.badRequest("Cannot delete a locked lookup");
        lookupRepository.delete(item);
    }

    private String generateCode(LookupType type) {
        long base = lookupRepository.countByType(type) + 1;
        String prefix = type.name().substring(0, Math.min(3, type.name().length()));
        String candidate;
        do {
            candidate = prefix + "-" + base++;
        } while (lookupRepository.existsByTypeAndCodeIgnoreCase(type, candidate));
        return candidate;
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private LookupResponseDTO toResponse(Lookup l) {
        return LookupResponseDTO.builder()
            .id(l.getId()).type(l.getType()).code(l.getCode())
            .nameAr(l.getNameAr()).nameEn(l.getNameEn()).parentId(l.getParentId())
            .sortOrder(l.getSortOrder()).active(l.isActive()).locked(l.isLocked()).build();
    }
}
