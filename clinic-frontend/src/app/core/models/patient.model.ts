export interface Patient {
  id: number; patientCode: string; firstName: string; lastName: string;
  nationalId?: string; dateOfBirth?: string; gender?: string; phone?: string; email?: string;
  address?: string; allergies?: string; chronicDiseases?: string; isActive?: boolean;
}