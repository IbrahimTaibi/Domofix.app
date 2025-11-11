import React from "react"
import { User } from "lucide-react"

interface AvatarButtonProps {
  imageUrl?: string | null
  alt?: string
  initials?: string
}

export function AvatarButton({ imageUrl, alt = "Avatar", initials }: AvatarButtonProps) {
  return (
    <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gray-200 bg-white">
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
      ) : initials ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-700 text-xs md:text-sm font-medium">
          {initials}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-700">
          <User className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
      )}
    </div>
  )}