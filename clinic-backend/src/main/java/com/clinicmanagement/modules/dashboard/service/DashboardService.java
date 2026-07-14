package com.clinicmanagement.modules.dashboard.service;
import com.clinicmanagement.modules.appointments.entity.AppointmentStatus;
import com.clinicmanagement.modules.appointments.repository.AppointmentRepository;
import com.clinicmanagement.modules.billing.repository.InvoiceRepository;
import com.clinicmanagement.modules.dashboard.dto.*;
import com.clinicmanagement.modules.doctors.entity.Doctor;
import com.clinicmanagement.modules.doctors.repository.DoctorRepository;
import com.clinicmanagement.modules.insurance.repository.ClaimRepository;
import com.clinicmanagement.modules.patients.repository.PatientRepository;
import com.clinicmanagement.modules.queue.repository.QueueTokenRepository;
import com.clinicmanagement.modules.queue.entity.QueueStatus;
import com.clinicmanagement.shared.branch.BranchContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;

@Service @RequiredArgsConstructor
public class DashboardService {
    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final ClaimRepository claimRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final BranchContextService branchContext;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        return getStats(null);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(Long branchIdOverride) {
        Long branchId = branchIdOverride != null ? branchIdOverride : branchContext.getFilterBranchId();
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);
        YearMonth ym = YearMonth.now();
        LocalDateTime monthStart = ym.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = ym.atEndOfMonth().atTime(LocalTime.MAX);
        BigDecimal revToday = invoiceRepository.sumPaidBetween(dayStart, dayEnd, branchId);
        BigDecimal revMonth = invoiceRepository.sumPaidBetween(monthStart, monthEnd, branchId);
        long queueWaiting = queueTokenRepository.countByQueueDateAndStatus(today, QueueStatus.WAITING, branchId);
        return DashboardStatsResponse.builder()
            .patientsToday(patientRepository.countByCreatedAtBetween(dayStart, dayEnd))
            .appointmentsToday(appointmentRepository.countByAppointmentDateAndBranchId(today, branchId))
            .queueWaiting(queueWaiting)
            .revenueToday(revToday == null ? BigDecimal.ZERO : revToday)
            .revenueMonth(revMonth == null ? BigDecimal.ZERO : revMonth)
            .build();
    }

    @Transactional(readOnly = true)
    public List<ChartPoint> getDailyRevenueChart() {
        return getDailyRevenueChart(null);
    }

    @Transactional(readOnly = true)
    public List<ChartPoint> getDailyRevenueChart(Long branchIdOverride) {
        Long branchId = branchIdOverride != null ? branchIdOverride : branchContext.getFilterBranchId();
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        List<ChartPoint> points = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = weekStart.plusDays(i);
            BigDecimal sum = invoiceRepository.sumPaidBetween(d.atStartOfDay(), d.atTime(LocalTime.MAX), branchId);
            points.add(ChartPoint.builder().label(d.toString()).value(sum == null ? BigDecimal.ZERO : sum).build());
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<ChartPoint> getAppointmentsChart() {
        return getAppointmentsChart(null);
    }

    @Transactional(readOnly = true)
    public List<ChartPoint> getAppointmentsChart(Long branchIdOverride) {
        Long branchId = branchIdOverride != null ? branchIdOverride : branchContext.getFilterBranchId();
        LocalDate today = LocalDate.now();
        List<ChartPoint> points = new ArrayList<>();
        for (Object[] row : appointmentRepository.countByStatus(today.minusDays(6), today.plusDays(1), branchId)) {
            points.add(ChartPoint.builder().label(String.valueOf(row[0])).count((Long) row[1]).build());
        }
        return points;
    }

    @Transactional(readOnly = true)
    public List<ChartPoint> getDoctorPerformanceChart() {
        return getDoctorPerformanceChart(LocalDate.now().minusDays(29), LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<ChartPoint> getDoctorPerformanceChart(LocalDate from, LocalDate to) {
        LocalDate rangeFrom = from != null ? from : LocalDate.now().minusDays(29);
        LocalDate rangeTo = to != null ? to : LocalDate.now();
        List<ChartPoint> doctorPerformance = new ArrayList<>();
        for (Doctor doctor : doctorRepository.findByActiveTrue()) {
            long completed = appointmentRepository.countByDoctorIdAndStatusAndAppointmentDateBetween(
                doctor.getId(), AppointmentStatus.COMPLETED, rangeFrom, rangeTo);
            doctorPerformance.add(ChartPoint.builder()
                .label(doctor.getFirstName() + " " + doctor.getLastName())
                .count(completed).build());
        }
        doctorPerformance.sort(Comparator.comparing(ChartPoint::getCount, Comparator.nullsLast(Comparator.reverseOrder())));
        return doctorPerformance;
    }

    @Transactional(readOnly = true)
    public DashboardReportResponse buildReport() {
        return buildReport(null);
    }

    @Transactional(readOnly = true)
    public DashboardReportResponse buildReport(Long branchIdOverride) {
        Long branchId = branchIdOverride != null ? branchIdOverride : branchContext.getFilterBranchId();
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        List<ChartPoint> dailyRevenue = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = weekStart.plusDays(i);
            LocalDateTime from = d.atStartOfDay();
            LocalDateTime to = d.atTime(LocalTime.MAX);
            BigDecimal sum = invoiceRepository.sumPaidBetween(from, to, branchId);
            dailyRevenue.add(ChartPoint.builder().label(d.toString()).value(sum == null ? BigDecimal.ZERO : sum).build());
        }

        List<ChartPoint> monthlyRevenue = new ArrayList<>();
        YearMonth ym = YearMonth.now();
        for (int m = 0; m < 6; m++) {
            YearMonth month = ym.minusMonths(5 - m);
            LocalDateTime from = month.atDay(1).atStartOfDay();
            LocalDateTime to = month.atEndOfMonth().atTime(LocalTime.MAX);
            BigDecimal sum = invoiceRepository.sumPaidBetween(from, to, branchId);
            monthlyRevenue.add(ChartPoint.builder().label(month.toString()).value(sum == null ? BigDecimal.ZERO : sum).build());
        }

        List<ChartPoint> topServices = new ArrayList<>();
        for (Object[] row : invoiceRepository.topServices(branchId)) {
            topServices.add(ChartPoint.builder().label(String.valueOf(row[0])).value((BigDecimal) row[1]).build());
        }

        List<ChartPoint> doctorPerformance = getDoctorPerformanceChart(today.minusDays(29), today);

        Map<String, Long> appointmentStats = new LinkedHashMap<>();
        for (Object[] row : appointmentRepository.countByStatus(today.minusMonths(1), today.plusDays(1), branchId)) {
            appointmentStats.put(String.valueOf(row[0]), (Long) row[1]);
        }

        Map<String, Long> insuranceClaims = new LinkedHashMap<>();
        for (Object[] row : claimRepository.countByStatus()) {
            insuranceClaims.put(String.valueOf(row[0]), (Long) row[1]);
        }

        Map<String, Long> patientStats = new LinkedHashMap<>();
        patientStats.put("total", patientRepository.count());
        patientStats.put("active", patientRepository.search(null, true, org.springframework.data.domain.Pageable.unpaged()).getTotalElements());

        return DashboardReportResponse.builder()
            .dailyRevenue(dailyRevenue).monthlyRevenue(monthlyRevenue)
            .doctorPerformance(doctorPerformance)
            .topServices(topServices).appointmentStats(appointmentStats)
            .insuranceClaims(insuranceClaims).patientStats(patientStats).build();
    }
}
