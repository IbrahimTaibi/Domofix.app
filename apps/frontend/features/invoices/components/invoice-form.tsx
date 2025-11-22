'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreateInvoiceDto,
  InvoiceLineItem,
  BillingAddress,
} from '../types/invoice.types';
import { createInvoice, updateInvoice } from '../services/invoice-service';
import { useRouter } from 'next/navigation';

const billingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  companyName: z.string().optional(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  discountType: z.enum(['amount', 'percentage']).optional(),
});

const invoiceFormSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  billTo: billingAddressSchema,
  billFrom: billingAddressSchema,
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  taxId: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  orderId: string;
  initialData?: Partial<InvoiceFormData>;
  invoiceId?: string;
}

export function InvoiceForm({ orderId, initialData, invoiceId }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      orderId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      lineItems: [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
          discount: 0,
          discountType: 'amount',
        },
      ],
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const lineItems = watch('lineItems');

  const calculateSubtotal = () => {
    return lineItems.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    lineItems.forEach((item) => {
      const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
      subtotal += itemSubtotal;

      // Calculate discount
      let itemDiscount = 0;
      if (item.discount && item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemDiscount = (itemSubtotal * item.discount) / 100;
        } else {
          itemDiscount = item.discount;
        }
      }
      discountAmount += itemDiscount;

      // Calculate tax
      const taxableAmount = itemSubtotal - itemDiscount;
      const itemTax = (taxableAmount * (item.taxRate || 0)) / 100;
      taxAmount += itemTax;
    });

    return {
      subtotal,
      taxAmount,
      discountAmount,
      total: subtotal - discountAmount + taxAmount,
    };
  };

  const totals = calculateTotal();

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setLoading(true);
      setError(null);

      const invoiceData: CreateInvoiceDto = {
        orderId: data.orderId,
        billTo: data.billTo,
        billFrom: data.billFrom,
        dueDate: data.dueDate,
        lineItems: data.lineItems,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        taxId: data.taxId,
      };

      if (invoiceId) {
        await updateInvoice(invoiceId, invoiceData);
      } else {
        await createInvoice(invoiceData);
      }

      router.push('/dashboard/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Invoice Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              {...register('issueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bill From */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bill From (Provider)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              {...register('billFrom.fullName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billFrom?.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billFrom.fullName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              {...register('billFrom.companyName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street *
            </label>
            <input
              {...register('billFrom.street')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billFrom?.street && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billFrom.street.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              {...register('billFrom.city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billFrom?.city && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billFrom.city.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              {...register('billFrom.state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code *
            </label>
            <input
              {...register('billFrom.zipCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billFrom?.zipCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billFrom.zipCode.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              {...register('billFrom.country')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billFrom?.country && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billFrom.country.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              {...register('billFrom.phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('billFrom.email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bill To (Customer)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              {...register('billTo.fullName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billTo?.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billTo.fullName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              {...register('billTo.companyName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street *
            </label>
            <input
              {...register('billTo.street')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billTo?.street && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billTo.street.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              {...register('billTo.city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billTo?.city && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billTo.city.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              {...register('billTo.state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code *
            </label>
            <input
              {...register('billTo.zipCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billTo?.zipCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billTo.zipCode.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              {...register('billTo.country')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.billTo?.country && (
              <p className="text-red-500 text-sm mt-1">
                {errors.billTo.country.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              {...register('billTo.phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('billTo.email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Line Items</h2>
          <button
            type="button"
            onClick={() =>
              append({
                description: '',
                quantity: 1,
                unitPrice: 0,
                taxRate: 0,
                discount: 0,
                discountType: 'amount',
              })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-md">
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    {...register(`lineItems.${index}.description`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lineItems.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lineItems.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lineItems.${index}.taxRate`, {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`lineItems.${index}.discount`, {
                        valueAsNumber: true,
                      })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <select
                      {...register(`lineItems.${index}.discountType`)}
                      className="px-2 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="amount">$</option>
                      <option value="percentage">%</option>
                    </select>
                  </div>
                </div>
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Remove Item
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold">
                  -${totals.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">${totals.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID
            </label>
            <input
              {...register('taxId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Your tax identification number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any additional notes or comments"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              {...register('termsAndConditions')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Payment terms and conditions"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : invoiceId ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
