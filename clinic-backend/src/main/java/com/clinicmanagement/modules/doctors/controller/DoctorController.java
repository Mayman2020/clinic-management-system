package com.clinicmanagement.modules.doctors.controller;
import com.clinicmanagement.modules.doctors.dto.*;
import com.clinicmanagement.modules.doctors.entity.Specialty;
import com.clinicmanagement.modules.doctors.service.DoctorService;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/doctors") @RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;
    @GetMapping @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> search(Pageable pageable,
            @RequestParam(required = false) String q, @RequestParam(required = false) Specialty specialty,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.search(q, specialty, active, pageable)));
    }
    @GetMapping("/active") @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> listActive() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listActive()));
    }
    @GetMapping("/{id}") @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<DoctorResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getById(id)));
    }
    @PostMapping @RequiresPermission(module = "doctors", action = "create")
    public ResponseEntity<ApiResponse<DoctorResponse>> create(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.create(request)));
    }
    @PutMapping("/{id}") @RequiresPermission(module = "doctors", action = "edit")
    public ResponseEntity<ApiResponse<DoctorResponse>> update(@PathVariable Long id, @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.update(id, request)));
    }
    @PostMapping("/{id}/schedules") @RequiresPermission(module = "doctors", action = "edit")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> addSchedule(@PathVariable Long id, @Valid @RequestBody DoctorScheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.addSchedule(id, request)));
    }
    @GetMapping("/{id}/schedules") @RequiresPermission(module = "doctors", action = "view")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> listSchedules(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.listSchedules(id)));
    }
}
