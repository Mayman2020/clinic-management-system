export interface Invoice {
  id: number; invoiceNo: string; patientId: number; patientName?: string;
  status: string; subtotal?: number; discount?: number; tax?: number; total: number; paidAmount?: number;
}
export interface Payment {
  id: number; invoiceId: number; amount: number; paymentMethod: string; referenceNo?: string; paidAt?: string;
}