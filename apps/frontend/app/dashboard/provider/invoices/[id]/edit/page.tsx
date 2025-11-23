'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice, DocumentType } from '@/features/invoices/types/invoice.types';
import { getInvoiceById } from '@/features/invoices/services/invoice-service';
import { NewInvoiceForm } from '@/features/invoices/components/new-invoice-form';
import { QuoteForm } from '@/features/invoices/components/quote-form';
import { toast } from 'react-hot-toast';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
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
        const docType = data.documentType === DocumentType.QUOTE ? 'devis' : 'facture';
        toast.error(`Seuls les ${docType} brouillon peuvent être modifiés`);
        router.push('/dashboard/provider/invoices');
        return;
      }

      setInvoice(data);
    } catch (err: any) {
      toast.error(err.message || 'Échec du chargement du document');
      router.push('/dashboard/provider/invoices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Document introuvable ou ne peut pas être modifié
        </div>
      </section>
    );
  }

  const isQuote = invoice.documentType === DocumentType.QUOTE;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isQuote ? 'Modifier le devis' : 'Modifier la facture'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isQuote ? 'Devis' : 'Facture'} #{invoice.invoiceNumber}
        </p>
      </div>

      {isQuote ? (
        <QuoteForm
          orderId={invoice.orderId as string}
          customerId={typeof invoice.customerId === 'string' ? invoice.customerId : invoice.customerId?._id}
          quoteId={invoice._id}
          mode="edit"
        />
      ) : (
        <NewInvoiceForm
          orderId={invoice.orderId as string}
          invoiceId={invoice._id}
          mode="edit"
          documentType="invoice"
        />
      )}
    </section>
  );
}
