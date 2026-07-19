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

export interface InvoicePrintData {
  invoiceNo?: string;
  patientName?: string;
  status?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  paidAmount?: number;
  items?: InvoiceItem[];
  createdAt?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  consultationTitle?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  patientPhone?: string;
  patientDob?: string;
  patientAge?: string;
  consultationDateTime?: string;
}