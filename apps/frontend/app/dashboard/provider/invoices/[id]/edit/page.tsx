'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Invoice } from '@/features/invoices/types/invoice.types';
import { getInvoiceById } from '@/features/invoices/services/invoice-service';
import { NewInvoiceForm } from '@/features/invoices/components/new-invoice-form';
import { toast } from 'react-hot-toast';

export default function EditInvoicePage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoiceById(params.id as string);

      if (data.status !== 'draft') {
        toast.error('Only draft invoices can be edited');
        return;
      }

      setInvoice(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
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
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Invoice not found or cannot be edited
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

      <NewInvoiceForm
        orderId={invoice.orderId as string}
        invoiceId={invoice._id}
        mode="edit"
      />
    </section>
  );
}
