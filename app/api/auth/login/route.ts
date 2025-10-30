import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/mock-data/users'
import { ApiResponse, User } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email et mot de passe requis',
        message: 'Veuillez fournir un email et un mot de passe'
      } as ApiResponse<null>, { status: 400 })
    }

    // Simulate network delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 800))

    // Validate credentials
    const user = validateCredentials(email, password)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      } as ApiResponse<null>, { status: 401 })
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      data: user,
      message: 'Connexion réussie'
    } as ApiResponse<User>, { status: 200 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la connexion'
    } as ApiResponse<null>, { status: 500 })
  }
}