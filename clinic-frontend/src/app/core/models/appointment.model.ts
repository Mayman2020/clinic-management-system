export interface Appointment {
  id: number; appointmentNo: string; patientId: number; doctorId: number;
  patientName?: string; doctorName?: string;
  appointmentDate: string; startTime: string; endTime?: string;
  status: string; appointmentType?: string; notes?: string;
}