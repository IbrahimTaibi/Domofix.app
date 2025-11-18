'use client';

import { useState } from 'react';
import { User } from '@domofix/shared-types';
import { Button } from '@/shared/components';
import { useToast } from '@/shared/hooks/use-toast';

interface NotificationSettingsProps {
  user: User;
  onClose: () => void;
}

interface NotificationPreferences {
  email: {
    marketing: boolean;
    security: boolean;
    updates: boolean;
    bookings: boolean;
  };
  push: {
    messages: boolean;
    bookings: boolean;
    reminders: boolean;
    marketing: boolean;
  };
  sms: {
    bookings: boolean;
    reminders: boolean;
    security: boolean;
  };
}

export default function NotificationSettings({ user, onClose }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      marketing: true,
      security: true,
      updates: true,
      bookings: true,
    },
    push: {
      messages: true,
      bookings: true,
      reminders: true,
      marketing: false,
    },
    sms: {
      bookings: true,
      reminders: false,
      security: true,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const handleToggle = (category: keyof NotificationPreferences, setting: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !(prev[category] as any)[setting],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real frontend-only app, you might save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(preferences));
      
      showSuccess('Préférences de notification mises à jour avec succès !', { title: 'Préférences enregistrées' });
      onClose();
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      
      // Show an error toast instead of alert
      const message = 'Échec de la mise à jour des préférences de notification. Veuillez réessayer.';
      // Use a slightly longer duration for errors
      showError(message, { title: 'Erreur', duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Paramètres de notification</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Email Notifications */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Notifications par e‑mail</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.email.bookings}
                onChange={() => handleToggle('email', 'bookings')}
                label="Mises à jour des réservations"
                description="Recevoir des e‑mails sur les confirmations, modifications et annulations de réservation"
              />
              <ToggleSwitch
                checked={preferences.email.security}
                onChange={() => handleToggle('email', 'security')}
                label="Alertes de sécurité"
                description="Notifications de sécurité importantes concernant votre compte"
              />
              <ToggleSwitch
                checked={preferences.email.updates}
                onChange={() => handleToggle('email', 'updates')}
                label="Mises à jour du produit"
                description="Nouvelles fonctionnalités, améliorations et mises à jour de la plateforme"
              />
              <ToggleSwitch
                checked={preferences.email.marketing}
                onChange={() => handleToggle('email', 'marketing')}
                label="Marketing et promotions"
                description="Offres spéciales, conseils et contenus promotionnels"
              />
            </div>
          </div>
          
          {/* Push Notifications */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718A8.97 8.97 0 003 15a9 9 0 0118 0 8.97 8.97 0 00-1.868 4.718M12 9v4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Notifications push</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.push.messages}
                onChange={() => handleToggle('push', 'messages')}
                label="Messages"
                description="Nouveaux messages de clients ou prestataires"
              />
              <ToggleSwitch
                checked={preferences.push.bookings}
                onChange={() => handleToggle('push', 'bookings')}
                label="Mises à jour des réservations"
                description="Mises à jour en temps réel de vos réservations"
              />
              <ToggleSwitch
                checked={preferences.push.reminders}
                onChange={() => handleToggle('push', 'reminders')}
                label="Rappels"
                description="Rappels pour vos rendez-vous et réservations à venir"
              />
              <ToggleSwitch
                checked={preferences.push.marketing}
                onChange={() => handleToggle('push', 'marketing')}
                label="Offres promotionnelles"
                description="Offres spéciales et promotions limitées dans le temps"
              />
            </div>
          </div>
          
          {/* SMS Notifications */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Notifications SMS</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.sms.bookings}
                onChange={() => handleToggle('sms', 'bookings')}
                label="Confirmations de réservation"
                description="Confirmations par SMS pour les nouvelles réservations"
              />
              <ToggleSwitch
                checked={preferences.sms.reminders}
                onChange={() => handleToggle('sms', 'reminders')}
                label="Rappels de rendez-vous"
                description="Rappels SMS avant vos rendez-vous"
              />
              <ToggleSwitch
                checked={preferences.sms.security}
                onChange={() => handleToggle('sms', 'security')}
                label="Codes de sécurité"
                description="Authentification à deux facteurs et codes de sécurité"
              />
            </div>
          </div>
          
          {/* Quiet Hours */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Heures silencieuses</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Définissez des heures silencieuses pour suspendre les notifications non urgentes à des moments précis.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="22:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="08:00"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="sm:order-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement en cours...
                </>
              ) : (
                'Enregistrer les préférences'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}