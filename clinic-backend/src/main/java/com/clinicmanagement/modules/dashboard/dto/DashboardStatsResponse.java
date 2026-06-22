package com.clinicmanagement.modules.dashboard.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class DashboardStatsResponse {
    private long patientsToday;
    private long appointmentsToday;
    private long queueWaiting;
    private BigDecimal revenueToday;
    private BigDecimal revenueMonth;
}
