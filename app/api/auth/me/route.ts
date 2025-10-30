import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/mock-data/users'
import { ApiResponse, User } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would extract user info from JWT token or session
    // For this mock, we'll use a header or query parameter
    const email = request.headers.get('x-user-email') || request.nextUrl.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié',
        message: 'Aucune information d\'utilisateur fournie'
      } as ApiResponse<null>, { status: 401 })
    }

    const user = findUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      } as ApiResponse<null>, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profil utilisateur récupéré'
    } as ApiResponse<User>, { status: 200 })

  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du profil'
    } as ApiResponse<null>, { status: 500 })
  }
}