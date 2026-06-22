package com.clinicmanagement.modules.dashboard.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardReportResponse {
    private List<ChartPoint> dailyRevenue;
    private List<ChartPoint> monthlyRevenue;
    private List<ChartPoint> doctorPerformance;
    private List<ChartPoint> topServices;
    private Map<String, Long> appointmentStats;
    private Map<String, Long> insuranceClaims;
    private Map<String, Long> patientStats;
}
