'use client';

import { InvoiceForm } from '@/features/invoices/components/invoice-form';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CreateInvoiceContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p>Please select an order to create an invoice for.</p>
          <a href="/dashboard/provider/orders" className="text-blue-600 hover:underline mt-2 inline-block">
            Go to Orders
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600 mt-2">Generate a new invoice for order #{orderId}</p>
      </div>

      <InvoiceForm orderId={orderId} />
    </section>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateInvoiceContent />
    </Suspense>
  );
}
