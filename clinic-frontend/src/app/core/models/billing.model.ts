export interface InvoiceItem {
  id: number; itemType?: string; description?: string; quantity?: number; unitPrice?: number; totalPrice?: number;
}
export interface Invoice {
  id: number; invoiceNo: string; patientId: number; patientName?: string; consultationId?: number;
  status: string; subtotal?: number; discount?: number; tax?: number; total: number; paidAmount?: number;
  notes?: string; items?: InvoiceItem[]; payments?: Payment[];
  createdAt?: string;
}
export interface Payment {
  id: number; invoiceId: number; amount: number; paymentMethod: string; referenceNo?: string; paidAt?: string;
}