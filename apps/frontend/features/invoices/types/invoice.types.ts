export enum DocumentType {
  QUOTE = 'quote',
  INVOICE = 'invoice',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',  // Pour devis seulement
  REJECTED = 'rejected',  // Pour devis seulement
  EXPIRED = 'expired',    // Pour devis seulement
  PAID = 'paid',          // Pour facture seulement
  OVERDUE = 'overdue',    // Pour facture seulement
  CANCELED = 'canceled',
  REFUNDED = 'refunded',  // Pour facture seulement
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_PAYMENT = 'mobile_payment',
  OTHER = 'other',
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  discountType?: 'amount' | 'percentage';
}

export interface BillingAddress {
  fullName: string;
  companyName?: string;
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface PaymentInfo {
  method?: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  notes?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  documentType: DocumentType;
  orderId: string;
  customerId: string | any;
  providerId: string | any;
  status: InvoiceStatus;
  billTo: BillingAddress;
  billFrom: BillingAddress;
  issueDate: string;
  dueDate: string;
  expiryDate?: string;  // Pour devis uniquement
  paidDate?: string;
  acceptedDate?: string;  // Pour devis uniquement
  convertedToInvoiceId?: string;  // Si devis converti en facture
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentInfo?: PaymentInfo;
  notes?: string;
  termsAndConditions?: string;
  taxId?: string;
  pdfUrl?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  orderId?: string;  // Optional for quotes
  customerId?: string;  // Can be used instead of orderId for quotes
  documentType?: DocumentType;
  billTo: BillingAddress;
  billFrom: BillingAddress;
  issueDate?: string;
  dueDate: string;
  expiryDate?: string;  // Pour devis uniquement
  lineItems: InvoiceLineItem[];
  notes?: string;
  termsAndConditions?: string;
  taxId?: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceDto {
  billTo?: BillingAddress;
  billFrom?: BillingAddress;
  issueDate?: string;
  dueDate?: string;
  expiryDate?: string;  // Pour devis uniquement
  lineItems?: InvoiceLineItem[];
  notes?: string;
  termsAndConditions?: string;
  taxId?: string;
  status?: InvoiceStatus;
  paymentInfo?: PaymentInfo;
  paidDate?: string;
  acceptedDate?: string;  // Pour devis uniquement
  convertedToInvoiceId?: string;  // Si devis converti en facture
  pdfUrl?: string;
}

export interface QueryInvoiceDto {
  customerId?: string;
  providerId?: string;
  orderId?: string;
  documentType?: DocumentType;
  status?: InvoiceStatus;
  issueDateFrom?: string;
  issueDateTo?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
}
