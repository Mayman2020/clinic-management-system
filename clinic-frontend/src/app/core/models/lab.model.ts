export interface LabRequest {
  id: number; requestNo: string; patientId: number; doctorId?: number; consultationId?: number;
  testType: string; testCategory?: string; status: string; notes?: string;
  requestedAt?: string; generatedInvoiceId?: number;
}