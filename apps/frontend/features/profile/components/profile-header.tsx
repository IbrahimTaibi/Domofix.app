"use client";

import { useState } from "react";
import { User } from "@darigo/shared-types";
import { Button } from "@/shared/components";
import ProfilePictureUpload from "./profile-picture-upload";

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isEditingPicture, setIsEditingPicture] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Cover Photo */}
      <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

      {/* Profile Content */}
      <div className="relative px-4 sm:px-6 pb-6">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16">
          <div className="relative mb-4 sm:mb-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg mx-auto sm:mx-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`Profile picture of ${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl sm:text-3xl font-bold">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </div>
              )}
            </div>

            {/* Edit Picture Button */}
            <button
              onClick={() => setIsEditingPicture(true)}
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Edit profile picture">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Edit Profile Button */}
          <Button
            variant="outline"
            className="mb-4 w-full sm:w-auto"
            aria-label="Edit profile information">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Profile
          </Button>
        </div>

        {/* User Info */}
        <div className="mt-4 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 capitalize text-sm sm:text-base">
            {user.role}
          </p>
          {/* Bio is not part of the User type, so removing this section */}

          {/* Contact Info */}
          <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center sm:justify-start">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="break-all">{user.email}</span>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center justify-center sm:justify-start">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      {isEditingPicture && (
        <ProfilePictureUpload
          user={user}
          onClose={() => setIsEditingPicture(false)}
        />
      )}
    </div>
  );
}
