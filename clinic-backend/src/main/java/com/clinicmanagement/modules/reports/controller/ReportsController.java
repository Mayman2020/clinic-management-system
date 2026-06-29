package com.clinicmanagement.modules.reports.controller;
import com.clinicmanagement.modules.dashboard.dto.ChartPoint;
import com.clinicmanagement.modules.dashboard.dto.DashboardReportResponse;
import com.clinicmanagement.modules.dashboard.service.DashboardService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/reports") @RequiredArgsConstructor
public class ReportsController {
    private final DashboardService dashboardService;

    @GetMapping("/revenue") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<List<ChartPoint>>> revenue() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.buildReport().getMonthlyRevenue()));
    }

    @GetMapping("/appointments") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<List<ChartPoint>>> appointments() {
        Map<String, Long> stats = dashboardService.buildReport().getAppointmentStats();
        List<ChartPoint> points = new ArrayList<>();
        stats.forEach((k, v) -> points.add(ChartPoint.builder().label(k).count(v).build()));
        return ResponseEntity.ok(ApiResponse.ok(points));
    }

    @GetMapping("/patients") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<List<ChartPoint>>> patients() {
        Map<String, Long> stats = dashboardService.buildReport().getPatientStats();
        List<ChartPoint> points = new ArrayList<>();
        stats.forEach((k, v) -> points.add(ChartPoint.builder().label(k).count(v).build()));
        return ResponseEntity.ok(ApiResponse.ok(points));
    }

    @GetMapping("/doctors") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<List<ChartPoint>>> doctors(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDoctorPerformanceChart(from, to)));
    }

    @GetMapping("/summary") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<com.clinicmanagement.modules.dashboard.dto.DashboardStatsResponse>> summary() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStats()));
    }

    @GetMapping("/full") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<DashboardReportResponse>> full() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.buildReport()));
    }

    @GetMapping(value = "/export", produces = "text/csv")
    @RequiresPermission(module = "reports", action = "export")
    public ResponseEntity<String> exportCsv() {
        var report = dashboardService.buildReport();
        StringBuilder csv = new StringBuilder("metric,value\n");
        if (report.getAppointmentStats() != null) {
            report.getAppointmentStats().forEach((k, v) -> csv.append("appointment_").append(k).append(",").append(v).append("\n"));
        }
        if (report.getMonthlyRevenue() != null) {
            report.getMonthlyRevenue().forEach(p -> csv.append("revenue_").append(p.getLabel()).append(",").append(p.getValue()).append("\n"));
        }
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=\"clinic-report.csv\"")
            .body(csv.toString());
    }
}
