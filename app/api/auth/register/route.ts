import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { generateToken } from '@/lib/jwt'
import { ApiResponse, User as UserType } from '@/types'

// Force Node.js runtime (required for jsonwebtoken and mongoose)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      userType = 'customer' 
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Champs requis manquants',
        message: 'Prénom, nom, email et mot de passe sont requis'
      } as ApiResponse<null>, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Format email invalide',
        message: 'Veuillez fournir un email valide'
      } as ApiResponse<null>, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      } as ApiResponse<null>, { status: 400 })
    }

    // Validate user type
    if (!['customer', 'provider'].includes(userType)) {
      return NextResponse.json({
        success: false,
        error: 'Type utilisateur invalide',
        message: 'Le type d\'utilisateur doit être customer ou provider'
      } as ApiResponse<null>, { status: 400 })
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Email déjà utilisé',
        message: 'Un compte avec cet email existe déjà'
      } as ApiResponse<null>, { status: 409 })
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone: phone || undefined,
      role: userType as 'customer' | 'provider'
    })

    await newUser.save()

    // Generate JWT token
    const token = await generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role
    })

    // Prepare user data (password is already excluded by toJSON transform)
    const userData: UserType = {
      id: newUser._id.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
      avatar: newUser.avatar,
      profilePicture: newUser.profilePicture,
      bio: newUser.bio,
      socialMedia: newUser.socialMedia,
      notificationPreferences: newUser.notificationPreferences,
      privacySettings: newUser.privacySettings,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString()
    }

    // Set HTTP-only cookie with JWT token
    const response = NextResponse.json({
      success: true,
      data: userData,
      message: 'Compte créé avec succès'
    } as ApiResponse<UserType>, { status: 201 })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/' // Must match the path used when clearing the cookie
    })

    return response

  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: messages.join(', ')
      } as ApiResponse<null>, { status: 400 })
    }

    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Email déjà utilisé',
        message: 'Un compte avec cet email existe déjà'
      } as ApiResponse<null>, { status: 409 })
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création du compte'
    } as ApiResponse<null>, { status: 500 })
  }
}