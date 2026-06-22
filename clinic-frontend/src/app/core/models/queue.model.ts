export interface QueueToken {
  id: number; tokenNumber: number; queueDate: string; doctorId?: number; doctorName?: string;
  patientId: number; patientName?: string; appointmentId?: number; status: string;
}