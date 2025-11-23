'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Plus, Trash2, Save, Eye, ArrowLeft, Building, User,
  Calendar, FileText, DollarSign, Percent, Clock
} from 'lucide-react';
import { createInvoice, updateInvoice } from '../services/invoice-service';
import { CreateInvoiceDto, DocumentType } from '../types/invoice.types';
import { useAuthStore } from '@/features/auth/store/auth-store';

const billingAddressSchema = z.object({
  fullName: z.string().min(1, 'Le nom complet est requis'),
  companyName: z.string().optional(),
  street: z.string().min(1, 'La rue est requise'),
  city: z.string().min(1, 'La ville est requise'),
  state: z.string().optional(),
  zipCode: z.string().min(1, 'Le code postal est requis'),
  country: z.string().min(1, 'Le pays est requis'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
});

const lineItemSchema = z.object({
  description: z.string().min(1, 'La description est requise'),
  quantity: z.number().min(0.01, 'La quantité doit être supérieure à 0'),
  unitPrice: z.number().min(0, 'Le prix unitaire doit être positif'),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  discountType: z.enum(['amount', 'percentage']).optional(),
});

const quoteFormSchema = z.object({
  billTo: billingAddressSchema,
  billFrom: billingAddressSchema,
  issueDate: z.string().min(1, 'La date d\'émission est requise'),
  expiryDate: z.string().min(1, 'La date d\'expiration est requise'),
  lineItems: z.array(lineItemSchema).min(1, 'Au moins un article est requis'),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  taxId: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  orderId?: string;
  customerId?: string;
  quoteId?: string;
  mode?: 'create' | 'edit';
}

export function QuoteForm({ orderId, customerId, quoteId, mode = 'create' }: QuoteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [existingQuote, setExistingQuote] = useState<any>(null);
  const user = useAuthStore((state) => state.user);

  // Load existing quote if in edit mode
  useEffect(() => {
    if (mode === 'edit' && quoteId) {
      loadExistingQuote();
    }
  }, [mode, quoteId]);

  const loadExistingQuote = async () => {
    try {
      const { getInvoiceById } = await import('../services/invoice-service');
      const quote = await getInvoiceById(quoteId!);
      setExistingQuote(quote);
    } catch (error) {
      console.error('Failed to load quote:', error);
      toast.error('Échec du chargement du devis');
    }
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: existingQuote ? {
      billTo: existingQuote.billTo,
      billFrom: existingQuote.billFrom,
      issueDate: existingQuote.issueDate ? new Date(existingQuote.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: existingQuote.expiryDate ? new Date(existingQuote.expiryDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: existingQuote.lineItems || [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discount: 0,
        discountType: 'amount',
      }],
      notes: existingQuote.notes || '',
      termsAndConditions: existingQuote.termsAndConditions || 'Ce devis est valable pendant 30 jours. Les prix indiqués sont TTC. Un acompte de 30% peut être demandé à la commande.',
      taxId: existingQuote.taxId || '',
    } : {
      billTo: {},
      billFrom: {},
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discount: 0,
        discountType: 'amount',
      }],
      notes: '',
      termsAndConditions: 'Ce devis est valable pendant 30 jours. Les prix indiqués sont TTC. Un acompte de 30% peut être demandé à la commande.',
      taxId: '',
    },
  });

  // Re-populate form when existing quote loads
  useEffect(() => {
    if (existingQuote) {
      setValue('billTo', existingQuote.billTo);
      setValue('billFrom', existingQuote.billFrom);
      setValue('issueDate', existingQuote.issueDate ? new Date(existingQuote.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setValue('expiryDate', existingQuote.expiryDate ? new Date(existingQuote.expiryDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setValue('lineItems', existingQuote.lineItems);
      setValue('notes', existingQuote.notes || '');
      setValue('termsAndConditions', existingQuote.termsAndConditions || '');
      setValue('taxId', existingQuote.taxId || '');
    }
  }, [existingQuote, setValue]);

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

  const onSubmit = async (data: QuoteFormData) => {
    try {
      setLoading(true);

      const quoteData: CreateInvoiceDto = {
        orderId,
        customerId,
        documentType: DocumentType.QUOTE,
        billTo: data.billTo,
        billFrom: data.billFrom,
        issueDate: data.issueDate,
        dueDate: data.expiryDate, // For quotes, we use expiryDate as dueDate in the backend
        expiryDate: data.expiryDate,
        lineItems: data.lineItems,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        taxId: data.taxId,
      };

      console.log('📝 Creating quote with data:', quoteData);
      console.log('🏷️  DocumentType:', DocumentType.QUOTE);

      if (mode === 'edit' && quoteId) {
        await updateInvoice(quoteId, quoteData);
        toast.success('Devis mis à jour avec succès !');
      } else {
        const result = await createInvoice(quoteData);
        console.log('✅ Quote created successfully:', result);
        toast.success('Devis créé avec succès !');
      }

      router.push('/dashboard/provider/invoices');
    } catch (err: any) {
      console.error('Quote save error:', err);
      toast.error(err.message || 'Échec de l\'enregistrement du devis');
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
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Masquer' : 'Aperçu'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Enregistrement...' : mode === 'edit' ? 'Mettre à jour le devis' : 'Créer le devis'}
          </button>
        </div>
      </div>

      {/* Quote Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Détails du devis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'émission *
            </label>
            <input
              type="date"
              {...register('issueDate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.issueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.issueDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Date d'expiration *
            </label>
            <input
              type="date"
              {...register('expiryDate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de TVA (Optionnel)
            </label>
            <input
              {...register('taxId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Votre numéro d'identification fiscale"
            />
          </div>
        </div>
      </div>

      {/* Bill From (Provider) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Proposé par (Vos informations)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input {...register('billFrom.fullName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billFrom?.fullName && <p className="text-red-500 text-sm mt-1">{errors.billFrom.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
            <input {...register('billFrom.companyName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input {...register('billFrom.street')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billFrom?.street && <p className="text-red-500 text-sm mt-1">{errors.billFrom.street.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <input {...register('billFrom.city')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billFrom?.city && <p className="text-red-500 text-sm mt-1">{errors.billFrom.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">État/Province</label>
            <input {...register('billFrom.state')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
            <input {...register('billFrom.zipCode')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billFrom?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.billFrom.zipCode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
            <input {...register('billFrom.country')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billFrom?.country && <p className="text-red-500 text-sm mt-1">{errors.billFrom.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input {...register('billFrom.phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('billFrom.email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
      </div>

      {/* Bill To (Customer) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Proposé à (Informations client)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input {...register('billTo.fullName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billTo?.fullName && <p className="text-red-500 text-sm mt-1">{errors.billTo.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
            <input {...register('billTo.companyName')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <input {...register('billTo.street')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billTo?.street && <p className="text-red-500 text-sm mt-1">{errors.billTo.street.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <input {...register('billTo.city')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billTo?.city && <p className="text-red-500 text-sm mt-1">{errors.billTo.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">État/Province</label>
            <input {...register('billTo.state')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
            <input {...register('billTo.zipCode')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billTo?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.billTo.zipCode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
            <input {...register('billTo.country')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            {errors.billTo?.country && <p className="text-red-500 text-sm mt-1">{errors.billTo.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input {...register('billTo.phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('billTo.email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Articles du devis</h3>
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
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un article
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    {...register(`lineItems.${index}.description`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Description de l'article"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qté *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA %</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`lineItems.${index}.taxRate`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remise</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`lineItems.${index}.discount`, { valueAsNumber: true })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      {...register(`lineItems.${index}.discountType`)}
                      className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="amount">DT</option>
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
          <div className="w-full md:w-80 space-y-3 bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total :</span>
              <span className="font-semibold">{totals.subtotal.toFixed(3)} DT</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Remise :</span>
                <span className="font-semibold">-{totals.discountAmount.toFixed(3)} DT</span>
              </div>
            )}
            {totals.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA :</span>
                <span className="font-semibold">{totals.taxAmount.toFixed(3)} DT</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-purple-300 pt-3">
              <span>Total :</span>
              <span className="text-purple-600">{totals.total.toFixed(3)} DT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations supplémentaires</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Notes ou commentaires supplémentaires pour le client"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conditions générales</label>
            <textarea
              {...register('termsAndConditions')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Conditions de validité du devis"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
