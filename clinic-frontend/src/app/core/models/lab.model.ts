export interface LabRequest {
  id: number; requestNo: string; patientId: number; doctorId?: number;
  testType: string; testCategory?: string; status: string; notes?: string;
}