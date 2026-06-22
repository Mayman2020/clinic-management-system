package com.clinicmanagement.modules.dashboard.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class ChartPoint {
    private String label;
    private BigDecimal value;
    private Long count;
}
