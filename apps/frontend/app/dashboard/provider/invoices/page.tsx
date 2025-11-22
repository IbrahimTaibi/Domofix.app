'use client';

import { InvoiceList } from '@/features/invoices/components/invoice-list';
import Link from 'next/link';

export default function ProviderInvoicesPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Invoices</h1>
          <p className="text-gray-600 mt-2">Manage and track your invoices</p>
        </div>
        <Link
          href="/dashboard/provider/invoices/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Invoice
        </Link>
      </div>

      <InvoiceList />
    </section>
  );
}