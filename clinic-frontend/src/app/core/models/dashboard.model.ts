export interface DashboardStats {
  patientsToday?: number;
  appointmentsToday?: number;
  queueWaiting?: number;
  revenueToday?: number;
  revenueMonth?: number;
}
export interface ChartPoint { label: string; value?: number; count?: number; }
export function chartValue(p: ChartPoint): number {
  return Number(p.value ?? p.count ?? 0);
}