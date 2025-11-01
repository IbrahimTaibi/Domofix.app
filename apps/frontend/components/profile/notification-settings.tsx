'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui';

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
      
      alert('Notification preferences updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      alert('Failed to update notification preferences. Please try again.');
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
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
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
              <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.email.bookings}
                onChange={() => handleToggle('email', 'bookings')}
                label="Booking Updates"
                description="Receive emails about booking confirmations, changes, and cancellations"
              />
              <ToggleSwitch
                checked={preferences.email.security}
                onChange={() => handleToggle('email', 'security')}
                label="Security Alerts"
                description="Important security notifications about your account"
              />
              <ToggleSwitch
                checked={preferences.email.updates}
                onChange={() => handleToggle('email', 'updates')}
                label="Product Updates"
                description="New features, improvements, and platform updates"
              />
              <ToggleSwitch
                checked={preferences.email.marketing}
                onChange={() => handleToggle('email', 'marketing')}
                label="Marketing & Promotions"
                description="Special offers, tips, and promotional content"
              />
            </div>
          </div>
          
          {/* Push Notifications */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718A8.97 8.97 0 003 15a9 9 0 0118 0 8.97 8.97 0 00-1.868 4.718M12 9v4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.push.messages}
                onChange={() => handleToggle('push', 'messages')}
                label="Messages"
                description="New messages from customers or service providers"
              />
              <ToggleSwitch
                checked={preferences.push.bookings}
                onChange={() => handleToggle('push', 'bookings')}
                label="Booking Updates"
                description="Real-time updates about your bookings"
              />
              <ToggleSwitch
                checked={preferences.push.reminders}
                onChange={() => handleToggle('push', 'reminders')}
                label="Reminders"
                description="Upcoming appointment and booking reminders"
              />
              <ToggleSwitch
                checked={preferences.push.marketing}
                onChange={() => handleToggle('push', 'marketing')}
                label="Promotional Offers"
                description="Special deals and limited-time offers"
              />
            </div>
          </div>
          
          {/* SMS Notifications */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.sms.bookings}
                onChange={() => handleToggle('sms', 'bookings')}
                label="Booking Confirmations"
                description="SMS confirmations for new bookings"
              />
              <ToggleSwitch
                checked={preferences.sms.reminders}
                onChange={() => handleToggle('sms', 'reminders')}
                label="Appointment Reminders"
                description="SMS reminders before your appointments"
              />
              <ToggleSwitch
                checked={preferences.sms.security}
                onChange={() => handleToggle('sms', 'security')}
                label="Security Codes"
                description="Two-factor authentication and security codes"
              />
            </div>
          </div>
          
          {/* Quiet Hours */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quiet Hours</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Set quiet hours to pause non-urgent notifications during specific times.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="22:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
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
              Cancel
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
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}