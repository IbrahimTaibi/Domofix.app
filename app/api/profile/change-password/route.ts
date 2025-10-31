import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// Force Node.js runtime (required for jsonwebtoken, mongoose, and bcryptjs)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = await verifyToken(token);

    // Get request body
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 },
      );
    }

    // Validate new password matches confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
        { status: 400 },
      );
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 },
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(decoded.userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
