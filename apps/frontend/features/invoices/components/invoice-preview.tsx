'use client';

import React, { useRef } from 'react';
import { Invoice, InvoiceStatus } from '../types/invoice.types';
import { format } from 'date-fns';
import { Download, Printer, Send, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose?: () => void;
  showActions?: boolean;
}

export function InvoicePreview({ invoice, onClose, showActions = true }: InvoicePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status: InvoiceStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-600',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || colors.draft;
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      toast.loading('Generating PDF...');

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);

      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    // TODO: Implement email sending
    toast.success('Send functionality coming soon!');
  };

  return (
    <div className="bg-white">
      {showActions && onClose && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            {invoice.status === 'draft' && (
              <button
                onClick={handleSend}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      <div ref={previewRef} className="max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-lg text-gray-600">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </span>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-gray-600">
                Issue Date: <span className="font-semibold text-gray-900">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</span>
              </p>
              <p className="text-gray-600">
                Due Date: <span className="font-semibold text-gray-900">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
              </p>
              {invoice.paidDate && (
                <p className="text-gray-600">
                  Paid Date: <span className="font-semibold text-green-600">{format(new Date(invoice.paidDate), 'MMM dd, yyyy')}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* From/To Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill From</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-gray-900">{invoice.billFrom.fullName}</p>
              {invoice.billFrom.companyName && <p className="text-gray-700">{invoice.billFrom.companyName}</p>}
              <p className="text-gray-600">{invoice.billFrom.street}</p>
              <p className="text-gray-600">
                {invoice.billFrom.city}, {invoice.billFrom.state} {invoice.billFrom.zipCode}
              </p>
              <p className="text-gray-600">{invoice.billFrom.country}</p>
              {invoice.billFrom.phone && <p className="text-gray-600">{invoice.billFrom.phone}</p>}
              {invoice.billFrom.email && <p className="text-gray-600">{invoice.billFrom.email}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-gray-900">{invoice.billTo.fullName}</p>
              {invoice.billTo.companyName && <p className="text-gray-700">{invoice.billTo.companyName}</p>}
              <p className="text-gray-600">{invoice.billTo.street}</p>
              <p className="text-gray-600">
                {invoice.billTo.city}, {invoice.billTo.state} {invoice.billTo.zipCode}
              </p>
              <p className="text-gray-600">{invoice.billTo.country}</p>
              {invoice.billTo.phone && <p className="text-gray-600">{invoice.billTo.phone}</p>}
              {invoice.billTo.email && <p className="text-gray-600">{invoice.billTo.email}</p>}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">Tax</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">Disc.</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice;
                let discount = 0;
                if (item.discount && item.discount > 0) {
                  discount = item.discountType === 'percentage'
                    ? (itemTotal * item.discount) / 100
                    : item.discount;
                }
                const afterDiscount = itemTotal - discount;
                const tax = (afterDiscount * (item.taxRate || 0)) / 100;
                const lineTotal = afterDiscount + tax;

                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-2 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 px-2 text-sm text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-2 text-sm text-right text-gray-600">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm text-right text-gray-600">{item.taxRate || 0}%</td>
                    <td className="py-3 px-2 text-sm text-right text-gray-600">
                      {item.discount ? `${item.discount}${item.discountType === 'percentage' ? '%' : '$'}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-semibold text-gray-900">${lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm py-2 text-green-600">
                <span>Discount:</span>
                <span className="font-semibold">-${invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold text-gray-900">${invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300">
              <span className="text-gray-900">Total:</span>
              <span className="text-blue-600">${invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.termsAndConditions || invoice.taxId) && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {invoice.taxId && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Tax ID</h4>
                <p className="text-sm text-gray-600">{invoice.taxId}</p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Terms & Conditions</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Info (if paid) */}
        {invoice.paymentInfo && invoice.paymentInfo.method && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Method: <span className="font-medium">{invoice.paymentInfo.method.replace('_', ' ').toUpperCase()}</span></p>
              {invoice.paymentInfo.transactionId && <p>Transaction ID: <span className="font-medium">{invoice.paymentInfo.transactionId}</span></p>}
              {invoice.paymentInfo.paidAt && <p>Paid At: <span className="font-medium">{format(new Date(invoice.paymentInfo.paidAt), 'MMM dd, yyyy HH:mm')}</span></p>}
              {invoice.paymentInfo.notes && <p>Notes: <span className="font-medium">{invoice.paymentInfo.notes}</span></p>}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Generated on {format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          <p className="mt-1">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
