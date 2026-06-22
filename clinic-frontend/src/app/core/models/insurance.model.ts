export interface InsuranceProvider {
  id: number; name: string; contactPhone?: string; contactEmail?: string; coverageNotes?: string; isActive?: boolean;
}
export interface InsuranceClaim {
  id: number; claimNo: string; patientId: number; providerId?: number; amount: number; status: string;
}