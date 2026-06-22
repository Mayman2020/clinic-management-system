package com.clinicmanagement.modules.queue.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class QueueDashboardResponse {
    private long waiting;
    private long called;
    private long inService;
    private long completed;
    private List<QueueTokenResponse> tokens;
    private Map<String, Long> statusChart;
}
