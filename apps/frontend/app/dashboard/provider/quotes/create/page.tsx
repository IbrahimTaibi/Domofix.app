'use client';

import { QuoteForm } from '@/features/invoices/components/quote-form';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function CreateQuoteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const customerId = searchParams.get('customerId');

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Créer un devis
        </h1>
        <p className="text-gray-600 mt-2">
          Générer un nouveau devis pour un client
        </p>
      </div>

      <QuoteForm
        orderId={orderId || undefined}
        customerId={customerId || undefined}
        mode="create"
      />
    </section>
  );
}

export default function CreateQuotePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      </div>
    }>
      <CreateQuoteContent />
    </Suspense>
  );
}
