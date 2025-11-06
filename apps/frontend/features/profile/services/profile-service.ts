import type { UpdateUserRequest, User } from '@darigo/shared-types'
import { apiClient } from '@/shared/utils/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ProfileService {
  async getProfile(): Promise<User> {
    return apiClient.getProfile()
  }

  /**
   * Update the current user's profile.
   * Note: Backend route may evolve; currently targets `/users/me`.
   */
  async updateProfile(payload: UpdateUserRequest): Promise<User> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Failed to update profile (${res.status})`)
    }
    return res.json()
  }
}

export const profileService = new ProfileService()
export default profileService