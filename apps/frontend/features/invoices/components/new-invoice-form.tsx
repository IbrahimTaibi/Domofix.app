'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Plus, Trash2, Save, Eye, ArrowLeft, Building, User,
  Calendar, FileText, DollarSign, Percent
} from 'lucide-react';
import { useInvoiceStore } from '../store/invoice-store';
import { createInvoice, updateInvoice } from '../services/invoice-service';
import { CreateInvoiceDto } from '../types/invoice.types';
import { useAuthStore } from '@/features/auth/store/auth-store';

const billingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  companyName: z.string().optional(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
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
  billTo: billingAddressSchema,
  billFrom: billingAddressSchema,
  dueDate: z.string().min(1, 'Due date is required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  taxId: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface NewInvoiceFormProps {
  orderId: string;
  invoiceId?: string;
  mode?: 'create' | 'edit';
}

export function NewInvoiceForm({ orderId, invoiceId, mode = 'create' }: NewInvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { draft, updateDraft } = useInvoiceStore();
  const user = useAuthStore((state) => state.user);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      billTo: draft?.billTo as any || {},
      billFrom: draft?.billFrom as any || {},
      dueDate: draft?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: draft?.lineItems || [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discount: 0,
        discountType: 'amount',
      }],
      notes: draft?.notes || '',
      termsAndConditions: draft?.termsAndConditions || 'Payment is due within 30 days. Late payments may incur additional fees.',
      taxId: draft?.taxId || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const lineItems = watch('lineItems');

  // Auto-fill provider info on mount
  useEffect(() => {
    if (user && mode === 'create') {
      setValue('billFrom.fullName', `${user.firstName} ${user.lastName}`);
      setValue('billFrom.email', user.email);

      if (user.address) {
        setValue('billFrom.street', user.address.street || '');
        setValue('billFrom.city', user.address.city || '');
        setValue('billFrom.state', user.address.state || '');
        setValue('billFrom.zipCode', user.address.postalCode || '');
        setValue('billFrom.country', user.address.country || '');
      }

      if (user.phoneNumber) {
        setValue('billFrom.phone', user.phoneNumber);
      }
    }
  }, [user, mode, setValue]);

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    lineItems.forEach((item) => {
      const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
      subtotal += itemSubtotal;

      let itemDiscount = 0;
      if (item.discount && item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemDiscount = (itemSubtotal * item.discount) / 100;
        } else {
          itemDiscount = item.discount;
        }
      }
      discountAmount += itemDiscount;

      const taxableAmount = itemSubtotal - itemDiscount;
      const itemTax = (taxableAmount * (item.taxRate || 0)) / 100;
      taxAmount += itemTax;
    });

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      total: Math.round((subtotal - discountAmount + taxAmount) * 100) / 100,
    };
  };

  const totals = calculateTotals();

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setLoading(true);

      const invoiceData: CreateInvoiceDto = {
        orderId,
        billTo: data.billTo,
        billFrom: data.billFrom,
        dueDate: data.dueDate,
        lineItems: data.lineItems,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        taxId: data.taxId,
      };

      if (mode === 'edit' && invoiceId) {
        await updateInvoice(invoiceId, invoiceData);
        toast.success('Invoice updated successfully!');
      } else {
        await createInvoice(invoiceData);
        toast.success('Invoice created successfully!');
      }

      router.push('/dashboard/provider/invoices');
    } catch (err: any) {
      console.error('Invoice save error:', err);
      toast.error(err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : mode === 'edit' ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID (Optional)
            </label>
            <input
              {...register('taxId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your tax identification number"
            />
          </div>
        </div>
      </div>

      {/* Bill From (Provider) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bill From (Your Information)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input {...register('billFrom.fullName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billFrom?.fullName && <p className="text-red-500 text-sm mt-1">{errors.billFrom.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input {...register('billFrom.companyName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input {...register('billFrom.street')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billFrom?.street && <p className="text-red-500 text-sm mt-1">{errors.billFrom.street.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input {...register('billFrom.city')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billFrom?.city && <p className="text-red-500 text-sm mt-1">{errors.billFrom.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input {...register('billFrom.state')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
            <input {...register('billFrom.zipCode')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billFrom?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.billFrom.zipCode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input {...register('billFrom.country')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billFrom?.country && <p className="text-red-500 text-sm mt-1">{errors.billFrom.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('billFrom.phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('billFrom.email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Bill To (Customer) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Bill To (Customer Information)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input {...register('billTo.fullName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billTo?.fullName && <p className="text-red-500 text-sm mt-1">{errors.billTo.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input {...register('billTo.companyName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input {...register('billTo.street')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billTo?.street && <p className="text-red-500 text-sm mt-1">{errors.billTo.street.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input {...register('billTo.city')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billTo?.city && <p className="text-red-500 text-sm mt-1">{errors.billTo.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input {...register('billTo.state')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
            <input {...register('billTo.zipCode')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billTo?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.billTo.zipCode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input {...register('billTo.country')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            {errors.billTo?.country && <p className="text-red-500 text-sm mt-1">{errors.billTo.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('billTo.phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('billTo.email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
          </div>
          <button
            type="button"
            onClick={() => append({
              description: '',
              quantity: 1,
              unitPrice: 0,
              taxRate: 0,
              discount: 0,
              discountType: 'amount',
            })}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    {...register(`lineItems.${index}.description`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Item description"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qty *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax %</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lineItems.${index}.taxRate`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`lineItems.${index}.discount`, { valueAsNumber: true })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      {...register(`lineItems.${index}.discountType`)}
                      className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="amount">$</option>
                      <option value="percentage">%</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-1 flex items-end">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full md:w-80 space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span className="font-semibold">-${totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">${totals.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total:</span>
              <span className="text-blue-600">${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes or comments"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
            <textarea
              {...register('termsAndConditions')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Payment terms and conditions"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
