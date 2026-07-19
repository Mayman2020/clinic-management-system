export interface Doctor {
  id: number; doctorCode: string; firstName: string; lastName: string;
  specialty: string; department?: string; phone?: string; email?: string;
  consultationFee?: number; isActive?: boolean;
  createdAt?: string; updatedAt?: string;
}
export interface DoctorSchedule {
  id: number; doctorId: number; dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean;
}