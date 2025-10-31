'use client';

import { useState, useRef, useCallback } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui';

interface ProfilePictureUploadProps {
  user: User;
  onClose: () => void;
}

export default function ProfilePictureUpload({ user, onClose }: ProfilePictureUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      
      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // Refresh the page or update the user context
        window.location.reload();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    
    try {
      const response = await fetch('/api/profile/picture', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Remove failed');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Update Profile Picture</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Current Picture */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Current Picture</p>
          <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-gray-200">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Current profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        {/* Upload Area */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Upload New Picture</p>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
                <p className="text-sm text-gray-600">{selectedFile?.name}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-gray-600">Drag and drop an image here, or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    browse files
                  </button>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
        
        {/* Actions */}
        <div className="flex flex-col space-y-3">
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload Picture'
              )}
            </Button>
          )}
          
          {user.profilePicture && (
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={isUploading}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              Remove Current Picture
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}