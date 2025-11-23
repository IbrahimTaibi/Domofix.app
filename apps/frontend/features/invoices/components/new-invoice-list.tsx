'use client';

import React, { useEffect, useState } from 'react';
import { Invoice, InvoiceStatus, DocumentType } from '../types/invoice.types';
import { getInvoices } from '../services/invoice-service';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Search, Filter, Eye, Edit, Download, Send,
  MoreVertical, FileText, CheckCircle, Clock,
  XCircle, DollarSign
} from 'lucide-react';
import { useInvoiceStore } from '../store/invoice-store';
import { toast } from 'react-hot-toast';
import { downloadInvoicePdf } from '../services/invoice-service';

export function NewInvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [documentTypeFilter, setDocumentTypeFilter] = useState<'all' | DocumentType>('all');

  const { statusFilter, searchQuery, setStatusFilter, setSearchQuery } = useInvoiceStore();

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, documentTypeFilter, currentPage]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const queryParams = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        documentType: documentTypeFilter !== 'all' ? documentTypeFilter : undefined,
        page: currentPage,
        limit: 10,
      };
      console.log('🔍 Loading invoices with params:', queryParams);
      const response = await getInvoices(queryParams);
      console.log('📦 Invoice response:', response);
      console.log('📄 Invoices data:', response.data);
      console.log('📊 Invoices by type:', response.data.reduce((acc: any, inv: Invoice) => {
        acc[inv.documentType] = (acc[inv.documentType] || 0) + 1;
        return acc;
      }, {}));
      setInvoices(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      console.error('❌ Failed to load invoices:', err);
      toast.error(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const badges = {
      draft: { icon: Edit, color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      sent: { icon: Send, color: 'bg-blue-100 text-blue-800', label: 'Envoyée' },
      accepted: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Acceptée' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rejetée' },
      expired: { icon: Clock, color: 'bg-orange-100 text-orange-800', label: 'Expirée' },
      paid: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Payée' },
      overdue: { icon: Clock, color: 'bg-red-100 text-red-800', label: 'En retard' },
      canceled: { icon: XCircle, color: 'bg-gray-100 text-gray-600', label: 'Annulée' },
      refunded: { icon: DollarSign, color: 'bg-purple-100 text-purple-800', label: 'Remboursée' },
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const getCustomerName = (invoice: Invoice) => {
    // For quotes without a linked customer, use billTo info
    if (typeof invoice.customerId === 'object' && invoice.customerId !== null) {
      return `${invoice.customerId.firstName} ${invoice.customerId.lastName}`;
    }
    return invoice.billTo.fullName;
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const customerName = getCustomerName(inv).toLowerCase();

    return (
      inv.invoiceNumber.toLowerCase().includes(query) ||
      customerName.includes(query) ||
      inv.billTo.companyName?.toLowerCase().includes(query)
    );
  });

  const statusFilters: Array<{ label: string; value: InvoiceStatus | 'all'; count?: number }> = [
    { label: 'Toutes', value: 'all' },
    { label: 'Brouillon', value: InvoiceStatus.DRAFT },
    { label: 'Envoyée', value: InvoiceStatus.SENT },
    { label: 'Payée', value: InvoiceStatus.PAID },
    { label: 'En retard', value: InvoiceStatus.OVERDUE },
    { label: 'Annulée', value: InvoiceStatus.CANCELED },
  ];

  if (loading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Search Bar - Top Priority */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par numéro, client, entreprise..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
          />
        </div>

        {/* Tabs for Document Type */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setDocumentTypeFilter('all')}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                documentTypeFilter === 'all'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setDocumentTypeFilter(DocumentType.INVOICE)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                documentTypeFilter === DocumentType.INVOICE
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Factures
            </button>
            <button
              onClick={() => setDocumentTypeFilter(DocumentType.QUOTE)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                documentTypeFilter === DocumentType.QUOTE
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Devis
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            Filtrer par statut
          </label>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === filter.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(documentTypeFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">Filtres actifs:</span>
            <div className="flex flex-wrap gap-2">
              {documentTypeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {documentTypeFilter === DocumentType.INVOICE ? 'Factures' : 'Devis'}
                  <button
                    onClick={() => setDocumentTypeFilter('all')}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {statusFilters.find(f => f.value === statusFilter)?.label}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  Recherche: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Affichage de <span className="font-semibold">{filteredInvoices.length}</span> sur{' '}
          <span className="font-semibold">{total}</span> document(s)
        </p>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            {documentTypeFilter === DocumentType.QUOTE
              ? 'Aucun devis trouvé'
              : documentTypeFilter === DocumentType.INVOICE
              ? 'Aucune facture trouvée'
              : 'Aucun document trouvé'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Essayez d\'ajuster votre recherche' : 'Créez votre premier document pour commencer'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance/Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${invoice.documentType === DocumentType.QUOTE ? 'bg-purple-50' : 'bg-blue-50'}`}>
                        <FileText className={`w-5 h-5 ${invoice.documentType === DocumentType.QUOTE ? 'text-purple-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {invoice.documentType === DocumentType.QUOTE ? 'Devis' : 'Facture'} • {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getCustomerName(invoice)}</p>
                      {invoice.billTo.companyName && (
                        <p className="text-xs text-gray-500">{invoice.billTo.companyName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {invoice.documentType === DocumentType.QUOTE && invoice.expiryDate
                      ? format(new Date(invoice.expiryDate), 'MMM dd, yyyy')
                      : format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-900">{invoice.totalAmount.toFixed(3)} DT</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/provider/invoices/${invoice._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {invoice.status === 'draft' && (
                        <Link
                          href={`/dashboard/provider/invoices/${invoice._id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            await downloadInvoicePdf(invoice._id, invoice.invoiceNumber);
                            toast.success('PDF téléchargé avec succès !');
                          } catch (error) {
                            toast.error('Échec du téléchargement du PDF');
                          }
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600 px-4">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
