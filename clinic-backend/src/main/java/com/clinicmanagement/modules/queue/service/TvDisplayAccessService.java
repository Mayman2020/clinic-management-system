package com.clinicmanagement.modules.queue.service;

import com.clinicmanagement.shared.exception.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TvDisplayAccessService {

    @Value("${clinic.tv.display-token:}")
    private String displayToken;

    public void validateAccess(String token) {
        if (displayToken == null || displayToken.isBlank()) {
            throw AppException.forbidden("TV display token is not configured on the server");
        }
        if (token == null || token.isBlank() || !displayToken.equals(token.trim())) {
            throw AppException.forbidden("Invalid TV display token");
        }
    }
}
