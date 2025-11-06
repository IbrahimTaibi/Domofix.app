'use client';

import { useState } from 'react';
import { User } from '@darigo/shared-types';
import { Button, Input } from '@/shared/components';
import EditProfileForm from './edit-profile-form';

interface ProfileInfoProps {
  user: User;
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              First Name
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md text-sm">
              {user.firstName}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md text-sm">
              {user.lastName}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md text-sm break-all">
              {user.email}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md text-sm">
              {user.phoneNumber || 'Not provided'}
            </p>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bio
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md min-h-[60px] text-sm">
              {user.bio && user.bio.trim() ? user.bio : 'No bio provided'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Account Information */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md capitalize text-sm">
              {user.role}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Verification
            </label>
            <div className="flex items-center bg-gray-50 px-2.5 py-1.5 rounded-md text-sm">
              {user.security.emailVerified ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700">Verified</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-yellow-700">Pending verification</span>
                </>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Member Since
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md text-sm">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md text-sm">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Social Media Links */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Social Media</h2>
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Links
          </Button>
        </div>
        
        <div className="text-gray-500 text-center py-6">
          <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p>No social media links added yet</p>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileForm
          user={user}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}