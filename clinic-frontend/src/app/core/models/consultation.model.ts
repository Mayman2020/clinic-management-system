export interface Consultation {
  id: number;
  appointmentId?: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  status?: string;
  createdAt?: string;
}
