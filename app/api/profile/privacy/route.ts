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
    const {
      profileVisibility,
      showEmail,
      showPhone,
      allowMessages,
      allowBookings,
      dataCollection,
      marketingEmails,
      thirdPartySharing,
      activityTracking
    } = body;
    
    // Validate profile visibility
    const validVisibilityOptions = ['public', 'private', 'contacts'];
    if (!validVisibilityOptions.includes(profileVisibility)) {
      return NextResponse.json(
        { error: 'Invalid profile visibility option' },
        { status: 400 }
      );
    }
    
    // Validate boolean fields
    const booleanFields = {
      showEmail,
      showPhone,
      allowMessages,
      allowBookings,
      dataCollection,
      marketingEmails,
      thirdPartySharing,
      activityTracking
    };
    
    for (const [key, value] of Object.entries(booleanFields)) {
      if (typeof value !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid value for ${key}: must be boolean` },
          { status: 400 }
        );
      }
    }
    
    // Update user privacy settings
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        privacySettings: {
          profileVisibility,
          showEmail,
          showPhone,
          allowMessages,
          allowBookings,
          dataCollection,
          marketingEmails,
          thirdPartySharing,
          activityTracking,
        },
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
      message: 'Privacy settings updated successfully',
      privacySettings: updatedUser.privacySettings
    });
    
  } catch (error) {
    console.error('Privacy settings update error:', error);
    
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

export async function GET(request: NextRequest) {
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
    
    // Get user privacy settings
    const user = await User.findById(decoded.userId).select('privacySettings');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return default settings if none exist
    const defaultSettings = {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      allowBookings: true,
      dataCollection: true,
      marketingEmails: false,
      thirdPartySharing: false,
      activityTracking: true,
    };
    
    return NextResponse.json({
      privacySettings: user.privacySettings || defaultSettings
    });
    
  } catch (error) {
    console.error('Get privacy settings error:', error);
    
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