'use client';

import React, { useEffect, useState } from 'react';
import { Invoice, InvoiceStatus } from '../types/invoice.types';
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

export function NewInvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { statusFilter, searchQuery, setStatusFilter, setSearchQuery } = useInvoiceStore();

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, currentPage]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await getInvoices({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 10,
      });
      setInvoices(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const badges = {
      draft: { icon: Edit, color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      sent: { icon: Send, color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      paid: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Paid' },
      overdue: { icon: Clock, color: 'bg-red-100 text-red-800', label: 'Overdue' },
      canceled: { icon: XCircle, color: 'bg-gray-100 text-gray-600', label: 'Canceled' },
      refunded: { icon: DollarSign, color: 'bg-purple-100 text-purple-800', label: 'Refunded' },
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
    if (typeof invoice.customerId === 'object') {
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
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Canceled', value: 'canceled' },
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
      <div className="flex flex-col md:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredInvoices.length}</span> of{' '}
          <span className="font-semibold">{total}</span> invoices
        </p>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No invoices found</p>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Try adjusting your search' : 'Create your first invoice to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
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
                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-900">${invoice.totalAmount.toFixed(2)}</p>
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
                        onClick={() => toast.info('Download feature coming soon!')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
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
            Previous
          </button>
          <span className="text-sm text-gray-600 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
