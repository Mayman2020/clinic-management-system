package com.clinicmanagement.modules.appointments.controller;
import com.clinicmanagement.modules.appointments.dto.*;
import com.clinicmanagement.modules.appointments.entity.AppointmentStatus;
import com.clinicmanagement.modules.appointments.service.AppointmentService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/appointments") @RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;
    @GetMapping @RequiresPermission(module = "appointments", action = "view")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> list(Pageable pageable,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.list(pageable, q, status, doctorId)));
    }
    @GetMapping("/calendar") @RequiresPermission(module = "calendar", action = "view")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> calendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.calendar(from, to, doctorId, status)));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "appointments", action = "view")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getById(id)));
    }
    @PostMapping("/book") @RequiresPermission(module = "appointments", action = "create")
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.book(request)));
    }
    @PostMapping("/walk-in") @RequiresPermission(module = "appointments", action = "create")
    public ResponseEntity<ApiResponse<AppointmentResponse>> walkIn(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.walkIn(request)));
    }
    @PutMapping("/{id}/reschedule") @RequiresPermission(module = "appointments", action = "edit")
    public ResponseEntity<ApiResponse<AppointmentResponse>> reschedule(@PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.reschedule(id, request)));
    }
    @PatchMapping("/{id}/status") @RequiresPermission(module = "appointments", action = "edit")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(@PathVariable Long id, @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.updateStatus(id, status)));
    }
    @PostMapping("/{id}/cancel") @RequiresPermission(module = "appointments", action = "edit")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.cancel(id)));
    }
    @PostMapping("/{id}/confirm") @RequiresPermission(module = "appointments", action = "approve")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.confirm(id)));
    }
}
