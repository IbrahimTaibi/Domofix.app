import { User } from '@/types'

// Mock users for testing authentication
export const mockUsers: User[] = [
  // Customer users
  {
    id: 'customer-1',
    name: 'Marie Dubois',
    email: 'marie@example.com',
    phone: '+33123456789',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    userType: 'customer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'customer-2',
    name: 'Pierre Martin',
    email: 'pierre@example.com',
    phone: '+33123456790',
    userType: 'customer',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'customer-3',
    name: 'Sophie Laurent',
    email: 'sophie@example.com',
    phone: '+33123456791',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    userType: 'customer',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },

  // Provider users
  {
    id: 'provider-1',
    name: 'Jean Plombier',
    email: 'jean.plombier@example.com',
    phone: '+33123456792',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    userType: 'provider',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'provider-2',
    name: 'Amélie Coiffure',
    email: 'amelie.coiffure@example.com',
    phone: '+33123456793',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    userType: 'provider',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'provider-3',
    name: 'Marc Électricien',
    email: 'marc.electricien@example.com',
    phone: '+33123456794',
    userType: 'provider',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },

  // Admin user
  {
    id: 'admin-1',
    name: 'Admin Tawa',
    email: 'admin@tawa.com',
    phone: '+33123456795',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    userType: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// Mock credentials for testing (email -> password)
export const mockCredentials: Record<string, string> = {
  'marie@example.com': 'password123',
  'pierre@example.com': 'password123',
  'sophie@example.com': 'password123',
  'jean.plombier@example.com': 'password123',
  'amelie.coiffure@example.com': 'password123',
  'marc.electricien@example.com': 'password123',
  'admin@tawa.com': 'admin123'
}

// Helper functions
export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
}

export function validateCredentials(email: string, password: string): User | null {
  const user = findUserByEmail(email)
  if (!user) return null
  
  const expectedPassword = mockCredentials[email.toLowerCase()]
  if (expectedPassword && expectedPassword === password) {
    return user
  }
  
  return null
}

export function isEmailTaken(email: string): boolean {
  return mockUsers.some(user => user.email.toLowerCase() === email.toLowerCase())
}