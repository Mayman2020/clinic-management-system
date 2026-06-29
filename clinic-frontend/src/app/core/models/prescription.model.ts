export interface Prescription {
  id: number; prescriptionNo: string; patientId: number; patientName?: string; doctorId: number;
  consultationId?: number; status?: string; notes?: string; items?: PrescriptionItem[];
}
export interface PrescriptionItem {
  id?: number; medicineName: string; dosage?: string; frequency?: string; duration?: string; notes?: string;
}