'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice } from '@/features/invoices/types/invoice.types';
import { getInvoiceById, updateInvoice, cancelInvoice, deleteInvoice } from '@/features/invoices/services/invoice-service';
import { InvoicePreview } from '@/features/invoices/components/invoice-preview';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, XCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load invoice');
      router.push('/dashboard/provider/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;

    try {
      setActionLoading(true);
      await updateInvoice(invoice._id, { status: 'sent' });
      toast.success('Invoice sent successfully!');
      loadInvoice();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoice) return;
    if (!confirm('Are you sure you want to cancel this invoice?')) return;

    try {
      setActionLoading(true);
      await cancelInvoice(invoice._id);
      toast.success('Invoice canceled successfully!');
      loadInvoice();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    if (!confirm('Are you sure you want to delete this draft invoice? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      await deleteInvoice(invoice._id);
      toast.success('Invoice deleted successfully!');
      router.push('/dashboard/provider/invoices');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete invoice');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Invoice not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Actions */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/provider/invoices"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Invoices
            </Link>

            <div className="flex items-center gap-3">
              {invoice.status === 'draft' && (
                <>
                  <Link
                    href={`/dashboard/provider/invoices/${invoice._id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={handleSendInvoice}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send to Customer
                  </button>
                  <button
                    onClick={handleDeleteInvoice}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}

              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <button
                  onClick={handleCancelInvoice}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <InvoicePreview invoice={invoice} showActions={false} />
    </div>
  );
}
