'use client';

import { NewInvoiceForm } from '@/features/invoices/components/new-invoice-form';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function CreateInvoiceContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Order Required</h3>
          <p className="text-yellow-800 mb-4">
            Please select an order to create an invoice. Invoices must be linked to completed orders.
          </p>
          <Link
            href="/dashboard/provider/invoices"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600 mt-2">Generate a new invoice for order #{orderId.slice(-8)}</p>
      </div>

      <NewInvoiceForm orderId={orderId} mode="create" />
    </section>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <CreateInvoiceContent />
    </Suspense>
  );
}
