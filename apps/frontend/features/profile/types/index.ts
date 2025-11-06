export type { UpdateUserRequest, UpdatePasswordRequest, User } from '@darigo/shared-types'

// UI-facing form shape for editing profile
export type UpdateProfileForm = {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  countryCode?: string
  timezone?: string
  locale?: string
  avatar?: string
}