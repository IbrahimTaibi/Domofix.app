"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/shared/components';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export function ProviderRegistrationForm() {
  const { user, isAuthenticated, applyProvider, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    category: '',
    notes: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryOptions = [
    'Plomberie',
    'Électricité',
    'Peinture',
    'Jardinage',
    'Nettoyage',
    'Menuiserie',
    'Climatisation',
  ];

  useEffect(() => {
    setErrorMessage(null);
    setSubmissionState('idle');
  }, [isAuthenticated]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmissionState('idle');

    if (!isAuthenticated) {
      setErrorMessage("Vous devez être connecté pour postuler en tant que prestataire.");
      return;
    }

    if (!formData.phone) {
      setErrorMessage('Le numéro de téléphone est requis.');
      setSubmissionState('error');
      return;
    }
    if (!formData.category) {
      setErrorMessage("La catégorie d'activité est requise.");
      setSubmissionState('error');
      return;
    }
    if (!documentFile) {
      setErrorMessage("L'image du document de confirmation de l'entreprise est requise.");
      setSubmissionState('error');
      return;
    }

    try {
      await applyProvider({
        businessName: formData.businessName,
        phone: formData.phone,
        category: formData.category,
        notes: formData.notes || undefined,
      }, documentFile);
      setSubmissionState('success');
    } catch (error) {
      console.error('Provider application failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
      setSubmissionState('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '_custom') {
      setUseCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setUseCustomCategory(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDocumentFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setDocumentPreviewUrl(url);
    } else {
      setDocumentPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl);
    };
  }, [documentPreviewUrl]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Soumettre ma demande</h2>
        <p className="mt-2 text-gray-600">
          Les informations requises: nom de l'entreprise, numéro de téléphone, catégorie et une image du document justificatif.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-gray-700 mb-4">
            Vous devez être connecté pour faire une demande. Créez un compte ou connectez-vous pour continuer.
          </p>
          <div className="flex gap-3">
            <Link href="/auth" className="w-full">
              <Button className="w-full" variant="primary">Se connecter / S'inscrire</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {user?.providerStatus === 'approved' && (
            <div className="mb-6 p-4 border border-green-200 rounded-md bg-green-50 text-green-700">
              Votre compte prestataire est approuvé. Vous pouvez proposer des services.
            </div>
          )}
          {user?.providerStatus === 'pending' && (
            <div className="mb-6 p-4 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-700">
              Votre demande est en cours de traitement. Nous vous informerons par email dès qu'elle sera approuvée.
            </div>
          )}
          {user?.providerStatus === 'rejected' && (
            <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
              Votre demande précédente a été refusée. Vous pouvez soumettre une nouvelle demande si nécessaire.
            </div>
          )}
          {user?.providerStatus === 'needs_info' && (
            <div className="mb-6 p-4 border border-orange-200 rounded-md bg-orange-50 text-orange-700">
              Des informations supplémentaires sont requises pour votre demande. Merci de compléter les détails ci-dessous.
            </div>
          )}

          <form onSubmit={(e) => { setErrorMessage(null); handleSubmit(e); }} className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Informations du prestataire</h3>
              <p className="mt-1 text-xs text-gray-500">Renseignez les détails de votre activité pour faciliter la vérification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                <Input
                  name="businessName"
                  type="text"
                  placeholder="Ex: Domofix Services"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Votre nom commercial tel qu'il apparaît sur vos documents.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Ex: +213 555 12 34 56"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Numéro joignable pour la validation et les clients.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie d'activité</label>
                <div ref={categoryDropdownRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isCategoryOpen}
                    onClick={() => setIsCategoryOpen((o) => !o)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsCategoryOpen(false);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <span className={(!formData.category && !useCustomCategory) ? 'text-gray-500' : 'text-gray-900'}>
                      {formData.category || (useCustomCategory ? 'Autre (saisir)' : 'Choisir une catégorie')}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.ul
                        role="listbox"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute z-10 mt-2 w-full max-h-56 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
                      >
                        {categoryOptions.map((opt) => {
                          const selected = !useCustomCategory && formData.category === opt;
                          return (
                            <li
                              key={opt}
                              role="option"
                              aria-selected={selected}
                              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 ${selected ? 'bg-gray-50' : ''}`}
                              onClick={() => {
                                setUseCustomCategory(false);
                                setFormData((prev) => ({ ...prev, category: opt }));
                                setIsCategoryOpen(false);
                              }}
                            >
                              <span className="text-sm text-gray-900">{opt}</span>
                              {selected && <Check className="h-4 w-4 text-primary-600" />}
                            </li>
                          );
                        })}

                        <li
                          role="option"
                          aria-selected={useCustomCategory}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 ${useCustomCategory ? 'bg-gray-50' : ''}`}
                          onClick={() => {
                            setUseCustomCategory(true);
                            setFormData((prev) => ({ ...prev, category: '' }));
                            setIsCategoryOpen(false);
                          }}
                        >
                          <span className="text-sm text-gray-900">Autre (saisir)</span>
                          {useCustomCategory && <Check className="h-4 w-4 text-primary-600" />}
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <p className="mt-1 text-xs text-gray-500">Sélectionnez une catégorie ou choisissez "Autre" pour saisir la vôtre.</p>

                {useCustomCategory && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie personnalisée</label>
                    <Input
                      name="category"
                      type="text"
                      placeholder="Ex: Rénovation intérieure"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Document justificatif</h3>
              <p className="text-xs text-gray-500 mb-2">Photo nette du document (registre de commerce, carte professionnelle, etc.).</p>
              <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors cursor-pointer bg-gray-50">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700">Déposer l'image ici ou cliquer</span>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG, jusqu'à 5MB</p>
                </div>
                <input
                  name="document"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
              {documentPreviewUrl && (
                <div className="mt-3">
                  <img src={documentPreviewUrl} alt="Aperçu du document" className="h-32 w-auto rounded-md border border-gray-200 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Informations complémentaires (optionnel)</label>
              <textarea
                name="notes"
                placeholder="Détaillez votre activité, votre expérience ou vos certifications"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Envoi de la demande...' : 'Soumettre ma demande'}
            </Button>
          </form>

          {submissionState === 'success' && (
            <div className="mt-6 p-4 border border-blue-200 rounded-xl bg-blue-50 text-blue-700">
              Demande envoyée avec succès. Vous recevrez une notification lorsqu'elle sera traitée.
              <p className="mt-2 text-blue-700 text-sm">Notre équipe vérifie les documents et valide les profils sous 24–48h.</p>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            En soumettant cette demande, vous acceptez que vos informations soient utilisées pour vérifier votre activité professionnelle.
          </div>
        </>
      )}
    </div>
  );
}