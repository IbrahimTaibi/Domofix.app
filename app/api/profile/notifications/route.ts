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
    const { email, push, sms } = body;
    
    // Validate notification preferences structure
    if (!email || !push || !sms) {
      return NextResponse.json(
        { error: 'Invalid notification preferences format' },
        { status: 400 }
      );
    }
    
    // Validate email preferences
    const emailKeys = ['marketing', 'security', 'updates', 'bookings'];
    for (const key of emailKeys) {
      if (typeof email[key] !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid email preference: ${key}` },
          { status: 400 }
        );
      }
    }
    
    // Validate push preferences
    const pushKeys = ['messages', 'bookings', 'reminders', 'marketing'];
    for (const key of pushKeys) {
      if (typeof push[key] !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid push preference: ${key}` },
          { status: 400 }
        );
      }
    }
    
    // Validate SMS preferences
    const smsKeys = ['bookings', 'reminders', 'security'];
    for (const key of smsKeys) {
      if (typeof sms[key] !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid SMS preference: ${key}` },
          { status: 400 }
        );
      }
    }
    
    // Update user notification preferences
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        notificationPreferences: {
          email,
          push,
          sms,
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
      message: 'Notification preferences updated successfully',
      notificationPreferences: updatedUser.notificationPreferences
    });
    
  } catch (error) {
    console.error('Notification preferences update error:', error);
    
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
    
    // Get user notification preferences
    const user = await User.findById(decoded.userId).select('notificationPreferences');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return default preferences if none exist
    const defaultPreferences = {
      email: {
        marketing: true,
        security: true,
        updates: true,
        bookings: true,
      },
      push: {
        messages: true,
        bookings: true,
        reminders: true,
        marketing: false,
      },
      sms: {
        bookings: true,
        reminders: false,
        security: true,
      },
    };
    
    return NextResponse.json({
      notificationPreferences: user.notificationPreferences || defaultPreferences
    });
    
  } catch (error) {
    console.error('Get notification preferences error:', error);
    
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