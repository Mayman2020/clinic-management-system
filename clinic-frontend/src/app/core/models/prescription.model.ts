export interface Prescription {
  id: number; prescriptionNo: string; patientId: number; patientName?: string; doctorId: number;
  doctorName?: string; consultationId?: number; status?: string; notes?: string;
  items?: PrescriptionItem[]; createdAt?: string;
}
export interface PrescriptionItem {
  id?: number; medicineName: string; dosage?: string; frequency?: string; duration?: string; notes?: string;
}
