"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Input from '@/shared/components/input'
import Textarea from '@/shared/components/textarea'
import Button from '@/shared/components/button'
import { useValidation, required, pattern } from '@/shared/hooks/use-validation'
import { ServiceCategory, CreateRequestRequest } from '@domofix/shared-types'
import { categoryOptions, uploadRequestPhotos } from '../services/requests-service'
import { useRequestService } from '../hooks/useRequestService'
import { useRequestDraftStore, useRequestState } from '../store/request-store'
import { Phone, MapPin } from 'lucide-react'
import apiClient from '@/shared/utils/api'
import { useAuth } from '@/features/auth/components/providers/auth-provider'
import { useLocationData } from '@/shared/hooks/use-location-data'
import DateTimePicker from '@/shared/components/date-time-picker'
import PhotoUploader from '@/shared/components/photo-uploader'
import { useToast } from '@/shared/hooks/use-toast'
import { useRouter } from 'next/navigation'

export interface RequestServiceFormProps {
  className?: string
}

/**
 * RequestServiceForm
 * - Accessible, responsive form for creating a service request
 * - Uses shared UI components and validation hooks
 * - Persists draft state with Zustand
 */
export default function RequestServiceForm({ className }: RequestServiceFormProps) {
  const { draft, setDraft, clearDraft } = useRequestDraftStore()
  const { setLastRequest } = useRequestState()
  const { create, loading, error, clearError } = useRequestService()

  const [category, setCategory] = useState<ServiceCategory>(draft.category || ServiceCategory.OTHER)
  const [useGeo, setUseGeo] = useState<boolean>(false)

  const schema = useMemo(() => ({
    phone: [required('Le téléphone est requis'), pattern(/^\+?\d{8,15}$/i, 'Format de téléphone invalide')],
    estimatedTimeOfService: [required('La date estimée est requise')],
    details: [],
    street: [], city: [], state: [], postalCode: [], country: [],
  }), [])

  const { errors, validateField, validateForm, clearErrors } = useValidation(schema as any)
  const [formError, setFormError] = useState<string | null>(null)
  const { success: showSuccess, error: showError, info: showInfo, warning: showWarning } = useToast()
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError(); clearErrors(); setFormError(null)
    const form = e.target as HTMLFormElement
    const formValues = Object.fromEntries(new FormData(form).entries())
    const isValid = validateForm({
      phone: formValues.phone,
      estimatedTimeOfService: formValues.estimatedTimeOfService,
      details: formValues.details,
      street: formValues.street, city: formValues.city, state: formValues.state, postalCode: formValues.postalCode, country: formValues.country,
    })
    if (!isValid) return

    // Client-side guard: require either address or location based on toggle
    if (useGeo) {
      if (!selectedLocation && !currentLocation) {
        setFormError('Sélectionnez votre position ou désactivez la localisation pour saisir une adresse.')
        showWarning('Sélectionnez votre position ou saisissez votre adresse.', { title: 'Adresse requise' })
        return
      }
    } else {
      const hasAddress = !!(formValues.street || formValues.city || formValues.state || formValues.postalCode || formValues.country)
      if (!hasAddress) {
        setFormError('Renseignez votre adresse (au moins la rue et la ville) ou activez la localisation.')
        showWarning('Renseignez votre adresse ou activez la localisation.', { title: 'Adresse requise' })
        return
      }
    }

    const payload: CreateRequestRequest = {
      phone: formValues.phone as string,
      category,
      estimatedTimeOfService: new Date(formValues.estimatedTimeOfService as string).toISOString(),
      details: (formValues.details as string) || undefined,
    }

    // Compose either address or location
    if (!useGeo) {
      payload.address = {
        street: (formValues.street as string) || undefined,
        city: (formValues.city as string) || undefined,
        state: (formValues.state as string) || undefined,
        postalCode: (formValues.postalCode as string) || undefined,
        country: (formValues.country as string) || undefined,
      }
    } else {
      // Prefer selectedLocation then currentLocation
      const loc = selectedLocation || currentLocation
      if (loc) {
        payload.location = {
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: (loc as any).address,
          city: (loc as any).city,
          state: (loc as any).state,
          zipCode: (loc as any).zipCode,
        }
      }
    }

    const res = await create(payload)
    if (res) {
      let updated: any = res
      if (photos.length > 0) {
        try {
          const reqId = (updated as any)._id || (updated as any).id
          updated = await uploadRequestPhotos(reqId, photos)
        } catch {}
      }
      setLastRequest(updated)
      clearDraft()
      setPhotos([])
      showSuccess('Votre demande a été envoyée avec succès.', {
        title: 'Demande créée',
        action: { label: 'Voir l’historique', onClick: () => router.push('/history') },
      })
    } else if (error) {
      showError(error, { title: 'Échec de la demande', duration: 6000 })
    }
  }

  const onChangeDraft = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDraft({ [name]: value } as any)
    validateField(name, value)
  }

  // Avoid hydration mismatch: default to SSR-safe value, then resolve on client
  const [ready, setReady] = useState(false)
  const { isAuthenticated, user, isLoading } = useAuth()
  useEffect(() => setReady(true), [])
  const isCustomer = !!user && (user as any).role === 'customer'
  const isAuthed = ready ? (!isLoading && isAuthenticated && isCustomer) : true

  // Geolocation data hooks
  const { currentLocation, selectedLocation, isLoading: geoLoading, error: geoError, useCurrentAsSelected, clearLocation } = useLocationData()
  const [photos, setPhotos] = useState<File[]>([])
  const [formKey, setFormKey] = useState(0)
  const geoActiveToastShown = useRef(false)

  const handleClearDraft = () => {
    clearDraft()
    setPhotos([])
    setFormKey((k) => k + 1) // force remount to reset uncontrolled inputs
  }

  // If geolocation fails while enabled, automatically disable it and guide the user to use address fields
  useEffect(() => {
    if (useGeo && geoError) {
      // eslint-disable-next-line no-console
      console.warn('Geolocation failed, reverting to manual address entry:', geoError)
      setUseGeo(false)
      clearLocation()
      setFormError('La localisation a échoué. Veuillez saisir votre adresse manuellement.')
      showError(geoError || 'La localisation a échoué. Veuillez saisir votre adresse.', { title: 'Localisation', duration: 6000 })
    }
  }, [useGeo, geoError, clearLocation])

  // When geolocation is active and a location is available, show a one-time informational toast
  useEffect(() => {
    if (useGeo && (selectedLocation || currentLocation) && !geoLoading && !geoError && !geoActiveToastShown.current) {
      showInfo('Votre localisation est utilisée — l’adresse n’est pas nécessaire.', { title: 'Localisation activée' })
      geoActiveToastShown.current = true
    }
    if (!useGeo) {
      geoActiveToastShown.current = false
    }
  }, [useGeo, selectedLocation, currentLocation, geoLoading, geoError, showInfo])

  const handleUseCurrent = () => {
    const ok = useCurrentAsSelected()
    if (ok) {
      showSuccess('Position actuelle sélectionnée.', { title: 'Localisation' })
    } else {
      showWarning('Aucune position détectée pour le moment.', { title: 'Localisation' })
    }
  }

  const handleDisableLocation = () => {
    clearLocation()
    showInfo('Localisation désactivée. Vous pouvez saisir votre adresse.', { title: 'Localisation' })
  }

  return (
    <form key={formKey} aria-label="Demander un service" onSubmit={onSubmit} className={className}>
      {formError && (
        <div className="mb-4 rounded-md bg-red-50 p-4" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">{formError}</div>
            </div>
          </div>
        </div>
      )}
      {!isAuthed && (
        <div className="mb-6 rounded-md bg-yellow-50 p-4" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Connexion requise</h3>
              <p className="mt-2 text-sm text-yellow-700">Veuillez vous connecter en tant que client pour envoyer une demande.</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ligne 1 : Téléphone / Catégorie */}
        <div>
          <Input
            name="phone"
            label="Téléphone"
            placeholder="ex: +33123456789"
            required
            error={errors.phone}
            onChange={onChangeDraft}
            defaultValue={(draft as any).phone || ''}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            icon={Phone}
            helperText="Votre numéro est partagé uniquement avec le prestataire accepté."
            disabled={!isAuthed}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégorie</label>
          <select
            name="category"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={category}
            onChange={(e) => setCategory(e.target.value as ServiceCategory)}
            aria-label="Catégorie de service"
            disabled={!isAuthed}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">Choisissez la catégorie la plus proche de votre besoin.</p>
        </div>

        {/* Ligne 2 : Date/Heure / Détails */}
        <div>
          <DateTimePicker
            label="Date et heure de service"
            required
            disabled={!isAuthed}
            helperText="La demande se clôture automatiquement 1h après l’heure indiquée si elle n’est pas acceptée."
            value={(draft as any).estimatedTimeOfService ? new Date(draft.estimatedTimeOfService as any) : null}
            onChange={(date) => {
              const iso = date ? new Date(date).toISOString() : ''
              setDraft({ estimatedTimeOfService: iso } as any)
              validateField('estimatedTimeOfService', iso)
            }}
          />
          {/* Hidden input ensures the picker value is included in FormData */}
          <input type="hidden" name="estimatedTimeOfService" value={(draft as any).estimatedTimeOfService || ''} />
          {errors.estimatedTimeOfService && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedTimeOfService}</p>
          )}
        </div>
        <div>
          <Textarea
            name="details"
            label="Détails"
            placeholder="Décrivez le problème ou le service souhaité"
            error={errors.details}
            onChange={onChangeDraft}
            defaultValue={(draft as any).details || ''}
            disabled={!isAuthed}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Conseil: soyez précis (modèle, symptômes, disponibilités).</p>
            <span className="text-xs text-gray-400">{((draft as any)?.details?.length || 0)}/500</span>
          </div>
        </div>
      </div>

      {/* Photos uploader */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Photos (optionnel)</h3>
        <PhotoUploader
          value={photos}
          onChange={setPhotos}
          disabled={!isAuthed}
          maxFiles={5}
          helperText="Ajoutez jusqu’à 5 images (JPG/PNG)."
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
        {(error && (error.toLowerCase().includes('address') || error.toLowerCase().includes('location'))) && (
          <p className="mt-1 text-sm text-red-600">Renseignez l’adresse ou activez la localisation.</p>
        )}
        {useGeo && (selectedLocation || currentLocation) && !geoError && (
          <p className="mt-1 text-sm text-primary-700">
            Votre localisation est activée. Les champs d’adresse sont désactivés.
          </p>
        )}
        {/* Localisation — inviting card inside address section */}
        <div className="mt-4">
          <div className="rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-200 text-primary-700">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-primary-900">Utiliser ma localisation</p>
                  <p className="text-xs text-primary-800">Détecter automatiquement votre position pour remplir l’adresse.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-primary-900">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                  checked={useGeo}
                  onChange={(e) => setUseGeo(e.target.checked)}
                  disabled={!isAuthed}
                  aria-label="Activer la localisation"
                />
                <span>{useGeo ? 'Activée' : 'Activer'}</span>
              </label>
            </div>
            <div className="mt-3">
              {geoLoading && <span className="text-sm text-primary-800">Détection de la position…</span>}
              {!geoLoading && !geoError && currentLocation && !selectedLocation && (
                <span className="text-sm text-primary-800">Position détectée. Sélectionnez-la pour l’utiliser.</span>
              )}
              {geoError && <span className="text-sm text-red-700">{geoError}</span>}
              {(error && (error.toLowerCase().includes('location') || error.toLowerCase().includes('address'))) && (
                <span className="text-sm text-red-700 block mt-1">Vérifiez la localisation ou l’adresse saisie.</span>
              )}
              {selectedLocation && (
                <span className="text-sm text-primary-900">
                  Utilisation de la position: lat {selectedLocation.latitude.toFixed(5)}, lon {selectedLocation.longitude.toFixed(5)}
                </span>
              )}
              {useGeo && (selectedLocation || currentLocation) && !geoError && (
                <p className="mt-2 text-sm font-medium text-primary-900" aria-live="polite">
                  Votre localisation est utilisée — l’adresse n’est pas nécessaire.
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                {!selectedLocation && useGeo && (
                  <Button type="button" variant="secondary" size="sm" onClick={handleUseCurrent} disabled={geoLoading}>
                    Utiliser ma position
                  </Button>
                )}
                {selectedLocation && useGeo && (
                  <Button type="button" variant="outline" size="sm" onClick={handleDisableLocation}>
                    Désactiver
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input name="street" label="Rue" onChange={onChangeDraft} defaultValue={(draft as any).street || ''} disabled={!isAuthed || useGeo} />
          </div>
          <Input name="city" label="Ville" onChange={onChangeDraft} defaultValue={(draft as any).city || ''} disabled={!isAuthed || useGeo} />
          <Input name="state" label="Région/État" onChange={onChangeDraft} defaultValue={(draft as any).state || ''} disabled={!isAuthed || useGeo} />
          <Input name="postalCode" label="Code postal" onChange={onChangeDraft} defaultValue={(draft as any).postalCode || ''} disabled={!isAuthed || useGeo} />
          <Input name="country" label="Pays" onChange={onChangeDraft} defaultValue={(draft as any).country || ''} disabled={!isAuthed || useGeo} />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4" role="alert">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearError}>Fermer</Button>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" isLoading={loading} disabled={!isAuthed}>
          Envoyer la demande
        </Button>
        <Button type="button" variant="ghost" onClick={handleClearDraft} disabled={!isAuthed}>
          Effacer le brouillon
        </Button>
      </div>
    </form>
  )
}