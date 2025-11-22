import { create } from 'zustand';
import { Invoice, InvoiceStatus, BillingAddress } from '../types/invoice.types';
import { Order } from '@/features/orders/services/orders-service';

interface InvoiceDraft {
  orderId: string;
  order?: Order;
  billTo: Partial<BillingAddress>;
  billFrom: Partial<BillingAddress>;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
    discountType: 'amount' | 'percentage';
  }>;
  notes: string;
  termsAndConditions: string;
  taxId: string;
  dueDate: string;
}

interface InvoiceStore {
  // State
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  draft: InvoiceDraft | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  statusFilter: InvoiceStatus | 'all';
  searchQuery: string;

  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Draft management
  initDraft: (orderId: string, order?: Order) => void;
  updateDraft: (updates: Partial<InvoiceDraft>) => void;
  clearDraft: () => void;

  // Filters
  setStatusFilter: (status: InvoiceStatus | 'all') => void;
  setSearchQuery: (query: string) => void;

  // Computed
  getFilteredInvoices: () => Invoice[];
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  // Initial state
  invoices: [],
  currentInvoice: null,
  draft: null,
  isLoading: false,
  error: null,
  statusFilter: 'all',
  searchQuery: '',

  // Actions
  setInvoices: (invoices) => set({ invoices }),
  setCurrentInvoice: (currentInvoice) => set({ currentInvoice }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Draft management
  initDraft: (orderId, order) => {
    const billTo: Partial<BillingAddress> = {};
    const billFrom: Partial<BillingAddress> = {};

    // Auto-fill customer info if order is populated
    if (order && typeof order.customerId === 'object') {
      const customer = order.customerId;
      billTo.fullName = `${customer.firstName} ${customer.lastName}`;
      billTo.email = customer.email;

      // Get address from request if available
      if (typeof order.requestId === 'object' && order.requestId.address) {
        const addr = order.requestId.address;
        billTo.street = addr.street || '';
        billTo.city = addr.city || '';
        billTo.state = addr.state || '';
        billTo.zipCode = addr.postalCode || addr.zipCode || '';
        billTo.country = addr.country || '';
      }
    }

    // Line item from order (if service exists)
    const lineItems = [];
    if (order && typeof order.serviceId === 'object' && order.serviceId) {
      lineItems.push({
        description: order.serviceId.title || 'Service',
        quantity: 1,
        unitPrice: 0, // Provider will fill this
        taxRate: 0,
        discount: 0,
        discountType: 'amount' as const,
      });
    } else {
      lineItems.push({
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discount: 0,
        discountType: 'amount' as const,
      });
    }

    // Default due date: 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    set({
      draft: {
        orderId,
        order,
        billTo,
        billFrom,
        lineItems,
        notes: '',
        termsAndConditions: 'Payment is due within 30 days. Late payments may incur additional fees.',
        taxId: '',
        dueDate: dueDate.toISOString().split('T')[0],
      },
    });
  },

  updateDraft: (updates) => {
    const { draft } = get();
    if (!draft) return;

    set({ draft: { ...draft, ...updates } });
  },

  clearDraft: () => set({ draft: null }),

  // Filters
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Computed
  getFilteredInvoices: () => {
    const { invoices, statusFilter, searchQuery } = get();

    let filtered = invoices;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((inv) => {
        const customerName = typeof inv.customerId === 'object'
          ? `${inv.customerId.firstName} ${inv.customerId.lastName}`.toLowerCase()
          : inv.billTo.fullName.toLowerCase();

        return (
          inv.invoiceNumber.toLowerCase().includes(query) ||
          customerName.includes(query) ||
          inv.billTo.companyName?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  },
}));
