import { NextRequest, NextResponse } from 'next/server'
import { isEmailTaken } from '@/lib/mock-data/users'
import { ApiResponse, User } from '@/types'

export async function POST(request: NextRequest) {
  try {
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
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 8 caractères'
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

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if email is already taken
    if (isEmailTaken(email)) {
      return NextResponse.json({
        success: false,
        error: 'Email déjà utilisé',
        message: 'Un compte avec cet email existe déjà'
      } as ApiResponse<null>, { status: 409 })
    }

    // Create new user (in a real app, this would be saved to database)
    const newUser: User = {
      id: `${userType}-${Date.now()}`,
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      phone: phone || undefined,
      userType: userType as 'customer' | 'provider',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Return the created user
    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Compte créé avec succès'
    } as ApiResponse<User>, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création du compte'
    } as ApiResponse<null>, { status: 500 })
  }
}