import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

// Force Node.js runtime (required for jsonwebtoken and mongoose)
export const runtime = 'nodejs'

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token
    const decoded = await verifyToken(token);
    
    // Get request body
    const body = await request.json();
    const { firstName, lastName, email, phone, bio, socialMedia } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate phone format (optional)
    if (phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: decoded.userId }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered to another account' },
        { status: 400 }
      );
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || '',
        bio: bio?.trim() || '',
        socialMedia: socialMedia || {},
        updatedAt: new Date(),
      },
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof Error && error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}