'use client';

import { useState } from 'react';
import { User } from '@darigo/shared-types';
import { Button } from '@/shared/components';

interface PrivacySettingsProps {
  user: User;
  onClose: () => void;
}

interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
  allowBookings: boolean;
  dataCollection: boolean;
  marketingEmails: boolean;
  thirdPartySharing: boolean;
  activityTracking: boolean;
}

export default function PrivacySettings({ user, onClose }: PrivacySettingsProps) {
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowBookings: true,
    dataCollection: true,
    marketingEmails: false,
    thirdPartySharing: false,
    activityTracking: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (setting: keyof PrivacyPreferences) => {
    if (setting === 'profileVisibility') return; // Handle separately
    setPreferences(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleVisibilityChange = (visibility: 'public' | 'private' | 'contacts') => {
    setPreferences(prev => ({
      ...prev,
      profileVisibility: visibility,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real frontend-only app, you might save to localStorage
      localStorage.setItem('privacySettings', JSON.stringify(preferences));
      
      alert('Privacy settings updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('Failed to update privacy settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description, warning }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
    warning?: string;
  }) => (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {warning && (
          <p className="text-xs text-amber-600 mt-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {warning}
          </p>
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

  const RadioOption = ({ value, checked, onChange, label, description }: {
    value: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-start space-x-3 py-2">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
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
          {/* Profile Visibility */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Profile Visibility</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <RadioOption
                value="public"
                checked={preferences.profileVisibility === 'public'}
                onChange={() => handleVisibilityChange('public')}
                label="Public"
                description="Anyone can view your profile and basic information"
              />
              <RadioOption
                value="contacts"
                checked={preferences.profileVisibility === 'contacts'}
                onChange={() => handleVisibilityChange('contacts')}
                label="Contacts Only"
                description="Only people you've interacted with can view your profile"
              />
              <RadioOption
                value="private"
                checked={preferences.profileVisibility === 'private'}
                onChange={() => handleVisibilityChange('private')}
                label="Private"
                description="Your profile is hidden from search and public view"
              />
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.showEmail}
                onChange={() => handleToggle('showEmail')}
                label="Show Email Address"
                description="Display your email address on your public profile"
                warning={preferences.showEmail ? "Your email will be visible to others" : undefined}
              />
              <ToggleSwitch
                checked={preferences.showPhone}
                onChange={() => handleToggle('showPhone')}
                label="Show Phone Number"
                description="Display your phone number on your public profile"
                warning={preferences.showPhone ? "Your phone number will be visible to others" : undefined}
              />
            </div>
          </div>
          
          {/* Communication Preferences */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Communication</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.allowMessages}
                onChange={() => handleToggle('allowMessages')}
                label="Allow Direct Messages"
                description="Let other users send you direct messages"
              />
              <ToggleSwitch
                checked={preferences.allowBookings}
                onChange={() => handleToggle('allowBookings')}
                label="Allow Booking Requests"
                description="Allow customers to send you booking requests"
              />
            </div>
          </div>
          
          {/* Data & Privacy */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Data & Privacy</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.dataCollection}
                onChange={() => handleToggle('dataCollection')}
                label="Analytics & Improvement"
                description="Help us improve our service by sharing usage data"
              />
              <ToggleSwitch
                checked={preferences.activityTracking}
                onChange={() => handleToggle('activityTracking')}
                label="Activity Tracking"
                description="Track your activity to provide personalized recommendations"
              />
              <ToggleSwitch
                checked={preferences.thirdPartySharing}
                onChange={() => handleToggle('thirdPartySharing')}
                label="Third-Party Data Sharing"
                description="Share anonymized data with trusted partners for service improvement"
                warning={preferences.thirdPartySharing ? "Data may be shared with partners" : undefined}
              />
            </div>
          </div>
          
          {/* Marketing Preferences */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Marketing</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <ToggleSwitch
                checked={preferences.marketingEmails}
                onChange={() => handleToggle('marketingEmails')}
                label="Marketing Communications"
                description="Receive promotional emails and special offers"
              />
            </div>
          </div>
          
          {/* Data Rights */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Data Rights</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-2">You have the right to:</p>
                  <ul className="text-blue-700 space-y-1 list-disc list-inside">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Export your data</li>
                    <li>Restrict data processing</li>
                  </ul>
                  <p className="text-blue-700 mt-3">
                    To exercise these rights, contact our support team or use the account settings options.
                  </p>
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
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}