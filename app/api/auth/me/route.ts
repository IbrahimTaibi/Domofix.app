import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { verifyToken } from '@/lib/jwt'
import { ApiResponse, User as UserType } from '@/types'

// Force Node.js runtime (required for jsonwebtoken and mongoose)
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get JWT token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        message: 'Token d\'authentification manquant'
      } as ApiResponse<null>, { status: 401 })
    }

    // Verify JWT token
    let payload
    try {
      payload = await verifyToken(token)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Token invalide',
        message: 'Token d\'authentification invalide ou expiré'
      } as ApiResponse<null>, { status: 401 })
    }

    // Find user in database
    const user = await User.findById(payload.userId)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      } as ApiResponse<null>, { status: 404 })
    }

    // Prepare user data (password is already excluded by toJSON transform)
    const userData: UserType = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      profilePicture: user.profilePicture,
      bio: user.bio,
      socialMedia: user.socialMedia,
      notificationPreferences: user.notificationPreferences,
      privacySettings: user.privacySettings,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: userData,
      message: 'Profil utilisateur récupéré'
    } as ApiResponse<UserType>, { status: 200 })

  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du profil'
    } as ApiResponse<null>, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get JWT token from cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        message: 'Token d\'authentification manquant'
      } as ApiResponse<null>, { status: 401 })
    }

    // Verify JWT token
    let payload
    try {
      payload = await verifyToken(token)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Token invalide',
        message: 'Token d\'authentification invalide ou expiré'
      } as ApiResponse<null>, { status: 401 })
    }

    // Clear auth cookie (logout)
    const response = NextResponse.json({
      success: true,
      data: null,
      message: 'Déconnexion réussie'
    } as ApiResponse<null>, { status: 200 })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Must match the path used when setting the cookie
      maxAge: 0 // Expire immediately
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la déconnexion'
    } as ApiResponse<null>, { status: 500 })
  }
}