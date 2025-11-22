'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice } from '@/features/invoices/types/invoice.types';
import { getInvoiceById, markInvoiceAsPaid, cancelInvoice } from '@/features/invoices/services/invoice-service';
import { InvoiceTemplate } from '@/features/invoices/components/invoice-template';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoiceById(params.id as string);
      setInvoice(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // You can implement PDF download using jspdf or html2canvas
    alert('PDF download feature coming soon!');
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    const paymentMethod = prompt('Enter payment method (cash, credit_card, bank_transfer, mobile_payment, other):');
    if (!paymentMethod) return;

    try {
      setActionLoading(true);
      await markInvoiceAsPaid(invoice._id, {
        method: paymentMethod as any,
        paidAt: new Date().toISOString(),
      });
      loadInvoice();
    } catch (err: any) {
      alert(err.message || 'Failed to mark invoice as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    if (!confirm('Are you sure you want to cancel this invoice?')) return;

    try {
      setActionLoading(true);
      await cancelInvoice(invoice._id);
      loadInvoice();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel invoice');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error || 'Invoice not found'}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center no-print">
        <Link
          href="/dashboard/provider/invoices"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Invoices
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Download PDF
          </button>
          {invoice.status === 'draft' && (
            <Link
              href={`/dashboard/provider/invoices/${invoice._id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit
            </Link>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={handleMarkAsPaid}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Paid
            </button>
          )}
          {invoice.status !== 'paid' && invoice.status !== 'canceled' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Invoice Template */}
      <InvoiceTemplate invoice={invoice} />
    </section>
  );
}
