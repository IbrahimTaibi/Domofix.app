'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Invoice } from '@/features/invoices/types/invoice.types';
import { getInvoiceById } from '@/features/invoices/services/invoice-service';
import { InvoiceForm } from '@/features/invoices/components/invoice-form';

export default function EditInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoice();
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoiceById(params.id as string);

      if (data.status !== 'draft') {
        setError('Only draft invoices can be edited');
        return;
      }

      setInvoice(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
        <p className="text-gray-600 mt-2">Invoice #{invoice.invoiceNumber}</p>
      </div>

      <InvoiceForm
        orderId={invoice.orderId}
        invoiceId={invoice._id}
        initialData={{
          orderId: invoice.orderId,
          billTo: invoice.billTo,
          billFrom: invoice.billFrom,
          issueDate: invoice.issueDate?.split('T')[0],
          dueDate: invoice.dueDate?.split('T')[0],
          lineItems: invoice.lineItems,
          notes: invoice.notes,
          termsAndConditions: invoice.termsAndConditions,
          taxId: invoice.taxId,
        }}
      />
    </section>
  );
}
