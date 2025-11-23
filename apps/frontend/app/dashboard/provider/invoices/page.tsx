'use client';

import { useState, useEffect } from 'react';
import { NewInvoiceList } from '@/features/invoices/components/new-invoice-list';
import { OrderSelectionModal } from '@/features/invoices/components/order-selection-modal';
import { useInvoiceStore } from '@/features/invoices/store/invoice-store';
import { useRouter } from 'next/navigation';
import { Plus, FileText, DollarSign, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Order, getOrderById } from '@/features/orders/services/orders-service';
import { getInvoiceStatistics } from '@/features/invoices/services/invoice-service';
import { toast } from 'react-hot-toast';

export default function ProviderInvoicesPage() {
  const router = useRouter();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [documentType, setDocumentType] = useState<'invoice' | 'quote'>('invoice');
  const [stats, setStats] = useState<any>(null);
  const { initDraft } = useInvoiceStore();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await getInvoiceStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleSelectOrder = async (order: Order) => {
    try {
      // Fetch full order details if not populated
      const fullOrder = typeof order.requestId === 'string' || typeof order.customerId === 'string'
        ? await getOrderById(order._id)
        : order;

      // Initialize draft with order data
      initDraft(order._id, fullOrder);

      // Close modal and navigate with document type
      setShowOrderModal(false);

      // For quotes, order is optional - navigate without orderId if it's a quote
      if (documentType === 'quote') {
        router.push(`/dashboard/provider/invoices/create?type=quote&customerId=${typeof fullOrder.customerId === 'object' ? fullOrder.customerId._id : fullOrder.customerId}`);
      } else {
        router.push(`/dashboard/provider/invoices/create?orderId=${order._id}&type=${documentType}`);
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Factures & Devis</h1>
            <p className="text-gray-600 mt-2">Gérez et suivez vos factures et devis</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setDocumentType('invoice');
                setShowOrderModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer une facture
            </button>
            <button
              onClick={() => {
                // Navigate to dedicated quote creation page
                router.push('/dashboard/provider/quotes/create');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer un devis
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des factures</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats ? stats.totalInvoices : '-'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenu total</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats ? stats.totalRevenue.toFixed(3) : '-'} DT
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {stats ? stats.pendingInvoices : '-'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats ? stats.overdueInvoices : '-'}
                </p>
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
        documentType={documentType}
      />
    </section>
  );
}
