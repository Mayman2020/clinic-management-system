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

    @GetMapping("/full") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<DashboardReportResponse>> full() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.buildReport()));
    }
}
