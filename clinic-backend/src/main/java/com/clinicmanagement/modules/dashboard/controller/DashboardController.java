package com.clinicmanagement.modules.dashboard.controller;
import com.clinicmanagement.modules.dashboard.dto.*;
import com.clinicmanagement.modules.dashboard.service.DashboardService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/dashboard") @RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats") @RequiresPermission(module = "dashboard", action = "view")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStats()));
    }

    @GetMapping("/revenue") @RequiresPermission(module = "dashboard", action = "view")
    public ResponseEntity<ApiResponse<List<ChartPoint>>> revenue() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDailyRevenueChart()));
    }

    @GetMapping("/appointments") @RequiresPermission(module = "dashboard", action = "view")
    public ResponseEntity<ApiResponse<List<ChartPoint>>> appointments() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getAppointmentsChart()));
    }

    @GetMapping("/reports") @RequiresPermission(module = "reports", action = "view")
    public ResponseEntity<ApiResponse<DashboardReportResponse>> reports() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.buildReport()));
    }
}
