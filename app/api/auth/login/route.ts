import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/jwt";
import { ApiResponse, User as UserType } from "@/types";

// Force Node.js runtime (required for jsonwebtoken and mongoose)
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email et mot de passe requis",
          message: "Veuillez fournir un email et un mot de passe",
        } as ApiResponse<null>,
        { status: 400 },
      );
    }

    // Find user by email (explicitly select password field which is normally excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiants invalides",
          message: "Email ou mot de passe incorrect",
        } as ApiResponse<null>,
        { status: 401 },
      );
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur serveur",
          message: "Compte invalide. Veuillez contacter le support.",
        } as ApiResponse<null>,
        { status: 500 },
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiants invalides",
          message: "Email ou mot de passe incorrect",
        } as ApiResponse<null>,
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

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
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: user.updatedAt
        ? new Date(user.updatedAt).toISOString()
        : new Date().toISOString(),
    };

    // Set HTTP-only cookie with JWT token
    const response = NextResponse.json(
      {
        success: true,
        data: userData,
        message: "Connexion réussie",
      } as ApiResponse<UserType>,
      { status: 200 },
    );

    // Set cookie with proper configuration for persistence
    // Important: All cookie attributes must match exactly when clearing/setting
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/", // Must be set explicitly
      // Don't set domain - browser will use default (localhost for dev, actual domain in production)
    };

    response.cookies.set("auth-token", token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur",
        message: "Une erreur est survenue lors de la connexion",
      } as ApiResponse<null>,
      { status: 500 },
    );
  }
}
