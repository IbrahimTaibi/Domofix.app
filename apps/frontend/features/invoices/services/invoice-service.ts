import { httpRequest } from '@/shared/utils/http';
import { useAuthStore } from '@/features/auth/store/auth-store';
import {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  QueryInvoiceDto,
  InvoiceListResponse,
  InvoiceStatistics,
  PaymentInfo,
} from '../types/invoice.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    const lsToken = localStorage.getItem('auth_token');
    const storeToken = useAuthStore.getState().backendToken;
    const token = lsToken || storeToken || null;
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Create a new invoice
 */
export async function createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
  const url = `${API_BASE_URL}/invoices`;
  return httpRequest<Invoice>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
}

/**
 * Get all invoices with filters
 */
export async function getInvoices(
  params: QueryInvoiceDto = {}
): Promise<InvoiceListResponse> {
  const query = new URLSearchParams();

  if (params.customerId) query.set('customerId', params.customerId);
  if (params.providerId) query.set('providerId', params.providerId);
  if (params.orderId) query.set('orderId', params.orderId);
  if (params.status) query.set('status', params.status);
  if (params.issueDateFrom) query.set('issueDateFrom', params.issueDateFrom);
  if (params.issueDateTo) query.set('issueDateTo', params.issueDateTo);
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());

  const url = `${API_BASE_URL}/invoices${query.toString() ? `?${query.toString()}` : ''}`;
  return httpRequest<InvoiceListResponse>(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  });
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string): Promise<Invoice> {
  const url = `${API_BASE_URL}/invoices/${id}`;
  return httpRequest<Invoice>(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  });
}

/**
 * Get invoice by invoice number
 */
export async function getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
  const url = `${API_BASE_URL}/invoices/number/${invoiceNumber}`;
  return httpRequest<Invoice>(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  });
}

/**
 * Update invoice
 */
export async function updateInvoice(
  id: string,
  data: UpdateInvoiceDto
): Promise<Invoice> {
  const url = `${API_BASE_URL}/invoices/${id}`;
  return httpRequest<Invoice>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(
  id: string,
  paymentInfo: PaymentInfo
): Promise<Invoice> {
  const url = `${API_BASE_URL}/invoices/${id}/mark-paid`;
  return httpRequest<Invoice>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(paymentInfo),
  });
}

/**
 * Cancel invoice
 */
export async function cancelInvoice(id: string): Promise<Invoice> {
  const url = `${API_BASE_URL}/invoices/${id}/cancel`;
  return httpRequest<Invoice>(url, {
    method: 'PATCH',
    headers: { ...getAuthHeaders() },
  });
}

/**
 * Delete invoice (draft only)
 */
export async function deleteInvoice(id: string): Promise<void> {
  const url = `${API_BASE_URL}/invoices/${id}`;
  await httpRequest(url, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStatistics(): Promise<InvoiceStatistics> {
  const url = `${API_BASE_URL}/invoices/statistics`;
  return httpRequest<InvoiceStatistics>(url, {
    method: 'GET',
    headers: { ...getAuthHeaders() },
  });
}
