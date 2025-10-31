import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { mockUsers, mockCredentials } from '@/lib/mock-data/users'

// Force Node.js runtime (required for mongoose)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    console.log('🌱 Starting database seeding...')
    
    // Clear existing users (optional - remove this in production)
    await User.deleteMany({})
    console.log('🗑️ Cleared existing users')
    
    // Create users from mock data
    const createdUsers = []
    
    for (const mockUser of mockUsers) {
      const password = mockCredentials[mockUser.email]
      
      if (!password) {
        console.log(`⚠️ No password found for ${mockUser.email}, skipping...`)
        continue
      }
      
      const userData = {
        email: mockUser.email,
        password: password, // This will be hashed by the User model
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        phone: mockUser.phone,
        role: mockUser.role,
        isEmailVerified: mockUser.isEmailVerified,
        avatar: mockUser.avatar,
        profilePicture: mockUser.profilePicture,
        bio: mockUser.bio,
        socialMedia: mockUser.socialMedia,
        notificationPreferences: mockUser.notificationPreferences,
        privacySettings: mockUser.privacySettings
      }
      
      try {
        const user = new User(userData)
        await user.save()
        createdUsers.push({
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`
        })
        console.log(`✅ Created user: ${user.email} (${user.role})`)
      } catch (error) {
        console.error(`❌ Failed to create user ${mockUser.email}:`, error)
      }
    }
    
    console.log(`🎉 Seeding completed! Created ${createdUsers.length} users`)
    
    return NextResponse.json({
      success: true,
      message: `Database seeded successfully with ${createdUsers.length} users`,
      data: {
        usersCreated: createdUsers.length,
        users: createdUsers
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('❌ Seeding error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database seeding failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}