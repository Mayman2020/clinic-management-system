package com.clinicmanagement.shared.persistence;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Converter
public class StringListJsonConverter implements AttributeConverter<List<String>, String> {
    private static final ObjectMapper M = new ObjectMapper();
    private static final TypeReference<List<String>> TYPE = new TypeReference<>() {};
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) return null;
        try { return M.writeValueAsString(attribute); }
        catch (JsonProcessingException e) { throw new IllegalArgumentException("Failed to serialize string list", e); }
    }
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return new ArrayList<>();
        try {
            List<String> parsed = M.readValue(dbData, TYPE);
            return parsed == null ? new ArrayList<>() : parsed;
        } catch (Exception e) { return new ArrayList<>(Collections.singletonList(dbData)); }
    }
}
