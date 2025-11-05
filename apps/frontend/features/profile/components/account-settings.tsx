'use client';

import { useState } from 'react';
import { User } from '@darigo/shared-types';
import { Button } from '@/shared/components';
import ChangePasswordModal from './change-password-modal';
import NotificationSettings from './notification-settings';
import PrivacySettings from './privacy-settings';

interface AccountSettingsProps {
  user: User;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowChangePassword(true)}
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowNotifications(true)}
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718A8.97 8.97 0 003 15a9 9 0 0118 0 8.97 8.97 0 00-1.868 4.718M12 9v4" />
            </svg>
            Notification Settings
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPrivacy(true)}
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy Settings
          </Button>
        </div>
      </div>
      
      {/* Security Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Overview</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">Password</p>
                <p className="text-xs text-green-600">Strong password set</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Not enabled</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Login Activity</p>
                <p className="text-xs text-gray-500">View recent sessions</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View
            </Button>
          </div>
        </div>
      </div>
      
      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h2>
        
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download My Data
          </Button>
          
          <Button variant="outline" className="w-full justify-start text-yellow-600 border-yellow-200 hover:bg-yellow-50">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L12 12m6.364 6.364L12 12m0 0L5.636 5.636M12 12l6.364-6.364M12 12l-6.364 6.364" />
            </svg>
            Deactivate Account
          </Button>
          
          <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
      
      {showNotifications && (
        <NotificationSettings
          user={user}
          onClose={() => setShowNotifications(false)}
        />
      )}
      
      {showPrivacy && (
        <PrivacySettings
          user={user}
          onClose={() => setShowPrivacy(false)}
        />
      )}
    </div>
  );
}