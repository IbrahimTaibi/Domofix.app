'use client';

import { useState } from 'react';
import { NewInvoiceList } from '@/features/invoices/components/new-invoice-list';
import { OrderSelectionModal } from '@/features/invoices/components/order-selection-modal';
import { useInvoiceStore } from '@/features/invoices/store/invoice-store';
import { useRouter } from 'next/navigation';
import { Plus, FileText, DollarSign, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Order, getOrderById } from '@/features/orders/services/orders-service';
import { toast } from 'react-hot-toast';

export default function ProviderInvoicesPage() {
  const router = useRouter();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { initDraft } = useInvoiceStore();

  const handleSelectOrder = async (order: Order) => {
    try {
      // Fetch full order details if not populated
      const fullOrder = typeof order.requestId === 'string' || typeof order.customerId === 'string'
        ? await getOrderById(order._id)
        : order;

      // Initialize draft with order data
      initDraft(order._id, fullOrder);

      // Close modal and navigate
      setShowOrderModal(false);
      router.push(`/dashboard/provider/invoices/create?orderId=${order._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load order details');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-2">Manage and track your invoices</p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 mt-1">$-</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">-</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600 mt-1">-</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <NewInvoiceList />

      {/* Order Selection Modal */}
      <OrderSelectionModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onSelectOrder={handleSelectOrder}
      />
    </section>
  );
}
