import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Force Node.js runtime (required for jsonwebtoken, mongoose, and fs)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${decoded.userId}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Update user profile with new picture URL
    const profilePictureUrl = `/uploads/profiles/${fileName}`;
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        profilePicture: profilePictureUrl,
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
      message: 'Profile picture uploaded successfully',
      profilePictureUrl,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Profile picture upload error:', error);
    
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

export async function DELETE(request: NextRequest) {
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
    
    // Remove profile picture from user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $unset: { profilePicture: 1 },
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
      message: 'Profile picture removed successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Profile picture removal error:', error);
    
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