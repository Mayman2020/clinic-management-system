export interface RadiologyRequest {
  id: number; requestNo: string; patientId: number; doctorId?: number; consultationId?: number;
  studyType: string; status: string; scheduledAt?: string; notes?: string;
  reportText?: string; imageUrl?: string; generatedInvoiceId?: number;
}