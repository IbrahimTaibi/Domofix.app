'use client';

import React from 'react';
import { Invoice } from '../types/invoice.types';
import { format } from 'date-fns';

interface InvoiceTemplateProps {
  invoice: Invoice;
}

export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  const calculateLineItemTotal = (item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    let discount = 0;
    if (item.discount > 0) {
      discount =
        item.discountType === 'percentage'
          ? (subtotal * item.discount) / 100
          : item.discount;
    }
    const taxableAmount = subtotal - discount;
    const tax = (taxableAmount * (item.taxRate || 0)) / 100;
    return subtotal - discount + tax;
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-600 mt-2">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-semibold">Issue Date:</span>{' '}
              {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
            </p>
            <p>
              <span className="font-semibold">Due Date:</span>{' '}
              {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-8">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            invoice.status === 'paid'
              ? 'bg-green-100 text-green-800'
              : invoice.status === 'sent'
                ? 'bg-blue-100 text-blue-800'
                : invoice.status === 'overdue'
                  ? 'bg-red-100 text-red-800'
                  : invoice.status === 'canceled'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {invoice.status.toUpperCase()}
        </span>
      </div>

      {/* Bill From and Bill To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">FROM</h3>
          <div className="text-gray-800">
            <p className="font-semibold">{invoice.billFrom.fullName}</p>
            {invoice.billFrom.companyName && (
              <p className="text-sm">{invoice.billFrom.companyName}</p>
            )}
            <p className="text-sm">{invoice.billFrom.street}</p>
            <p className="text-sm">
              {invoice.billFrom.city}
              {invoice.billFrom.state ? `, ${invoice.billFrom.state}` : ''}{' '}
              {invoice.billFrom.zipCode}
            </p>
            <p className="text-sm">{invoice.billFrom.country}</p>
            {invoice.billFrom.phone && (
              <p className="text-sm mt-1">{invoice.billFrom.phone}</p>
            )}
            {invoice.billFrom.email && (
              <p className="text-sm">{invoice.billFrom.email}</p>
            )}
            {invoice.taxId && (
              <p className="text-sm mt-1">Tax ID: {invoice.taxId}</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO</h3>
          <div className="text-gray-800">
            <p className="font-semibold">{invoice.billTo.fullName}</p>
            {invoice.billTo.companyName && (
              <p className="text-sm">{invoice.billTo.companyName}</p>
            )}
            <p className="text-sm">{invoice.billTo.street}</p>
            <p className="text-sm">
              {invoice.billTo.city}
              {invoice.billTo.state ? `, ${invoice.billTo.state}` : ''}{' '}
              {invoice.billTo.zipCode}
            </p>
            <p className="text-sm">{invoice.billTo.country}</p>
            {invoice.billTo.phone && (
              <p className="text-sm mt-1">{invoice.billTo.phone}</p>
            )}
            {invoice.billTo.email && (
              <p className="text-sm">{invoice.billTo.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 text-sm font-semibold text-gray-700">
                Description
              </th>
              <th className="text-right py-2 text-sm font-semibold text-gray-700">
                Qty
              </th>
              <th className="text-right py-2 text-sm font-semibold text-gray-700">
                Rate
              </th>
              <th className="text-right py-2 text-sm font-semibold text-gray-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 text-sm text-gray-800">
                  {item.description}
                  {item.taxRate && item.taxRate > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Tax: {item.taxRate}%)
                    </span>
                  )}
                  {item.discount && item.discount > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Discount: {item.discount}
                      {item.discountType === 'percentage' ? '%' : ' fixed'})
                    </span>
                  )}
                </td>
                <td className="text-right py-3 text-sm text-gray-800">
                  {item.quantity}
                </td>
                <td className="text-right py-3 text-sm text-gray-800">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="text-right py-3 text-sm text-gray-800">
                  ${calculateLineItemTotal(item).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-800 font-semibold">
              ${invoice.subtotal.toFixed(2)}
            </span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="text-gray-800 font-semibold">
                -${invoice.discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-800 font-semibold">
                ${invoice.taxAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-gray-300">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-lg font-bold text-gray-800">
              ${invoice.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Terms and Conditions */}
      {invoice.termsAndConditions && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Terms & Conditions
          </h3>
          <p className="text-sm text-gray-600">{invoice.termsAndConditions}</p>
        </div>
      )}

      {/* Payment Info */}
      {invoice.status === 'paid' && invoice.paymentInfo && (
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-green-700 mb-2">
            Payment Information
          </h3>
          <div className="text-sm text-gray-600">
            {invoice.paymentInfo.method && (
              <p>
                <span className="font-semibold">Method:</span>{' '}
                {invoice.paymentInfo.method.replace('_', ' ').toUpperCase()}
              </p>
            )}
            {invoice.paymentInfo.transactionId && (
              <p>
                <span className="font-semibold">Transaction ID:</span>{' '}
                {invoice.paymentInfo.transactionId}
              </p>
            )}
            {invoice.paymentInfo.paidAt && (
              <p>
                <span className="font-semibold">Paid On:</span>{' '}
                {format(new Date(invoice.paymentInfo.paidAt), 'MMM dd, yyyy')}
              </p>
            )}
            {invoice.paymentInfo.notes && (
              <p className="mt-2">{invoice.paymentInfo.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
