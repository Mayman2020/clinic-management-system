export interface RadiologyRequest {
  id: number; requestNo: string; patientId: number; doctorId?: number;
  studyType: string; status: string; scheduledAt?: string; notes?: string;
}