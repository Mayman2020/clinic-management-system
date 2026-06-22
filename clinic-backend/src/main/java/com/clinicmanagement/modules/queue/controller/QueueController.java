package com.clinicmanagement.modules.queue.controller;
import com.clinicmanagement.modules.queue.dto.*;
import com.clinicmanagement.modules.queue.entity.QueueStatus;
import com.clinicmanagement.modules.queue.service.QueueService;
import com.clinicmanagement.modules.queue.service.QueueEventPublisher;
import com.clinicmanagement.modules.permission.annotation.RequiresPermission;
import com.clinicmanagement.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/queue") @RequiredArgsConstructor
public class QueueController {
    private final QueueService queueService;
    private final QueueEventPublisher eventPublisher;

    @PostMapping("/tokens") @RequiresPermission(module = "queue", action = "create")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> generate(@Valid @RequestBody QueueTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.generateToken(request)));
    }

    @GetMapping("/current") @RequiresPermission(module = "queue", action = "view")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> current(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.current(date, doctorId)));
    }

    @GetMapping("/dashboard") @RequiresPermission(module = "queue", action = "view")
    public ResponseEntity<ApiResponse<QueueDashboardResponse>> dashboard(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.dashboard(date, doctorId)));
    }

    @GetMapping("/today") @RequiresPermission(module = "queue", action = "view")
    public ResponseEntity<ApiResponse<List<QueueTokenResponse>>> today(@RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.todayTokens(doctorId)));
    }

    @PostMapping("/call-next") @RequiresPermission(module = "queue", action = "edit")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> callNext(@RequestBody(required = false) Map<String, Long> body) {
        Long doctorId = body != null ? body.get("doctorId") : null;
        return ResponseEntity.ok(ApiResponse.ok(queueService.callNext(doctorId)));
    }

    @GetMapping("/tv-display")
    public ResponseEntity<ApiResponse<List<QueueTokenResponse>>> tvDisplay() {
        return ResponseEntity.ok(ApiResponse.ok(queueService.tvDisplay()));
    }

    @PatchMapping("/tokens/{id}/status") @RequiresPermission(module = "queue", action = "edit")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> updateStatus(@PathVariable Long id, @RequestParam QueueStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.updateStatus(id, status)));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @RequiresPermission(module = "queue", action = "view")
    public SseEmitter stream() {
        return eventPublisher.subscribeDashboard();
    }

    @GetMapping(value = "/tv/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter tvStream() {
        return eventPublisher.subscribeTv();
    }
}
