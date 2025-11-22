export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
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
  orderId: string;
  customerId: string | any;
  providerId: string | any;
  status: InvoiceStatus;
  billTo: BillingAddress;
  billFrom: BillingAddress;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
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
  orderId: string;
  billTo: BillingAddress;
  billFrom: BillingAddress;
  issueDate?: string;
  dueDate: string;
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
  lineItems?: InvoiceLineItem[];
  notes?: string;
  termsAndConditions?: string;
  taxId?: string;
  status?: InvoiceStatus;
  paymentInfo?: PaymentInfo;
  paidDate?: string;
  pdfUrl?: string;
}

export interface QueryInvoiceDto {
  customerId?: string;
  providerId?: string;
  orderId?: string;
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
