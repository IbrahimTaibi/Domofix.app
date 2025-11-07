import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashPassword, comparePassword } from '@darigo/shared-utils';
import { User, UserDocument, Address } from './schemas/user.schema';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  countryCode?: string;
  timezone?: string;
  locale?: string;
  role?: 'customer' | 'provider';
  address?: Address;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await hashPassword(createUserDto.password);
    
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      // Initialize default values for new fields
      phoneVerification: {
        verified: false,
        attempts: 0,
      },
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        marketing: true,
        security: true,
      },
      security: {
        twoFactorEnabled: false,
        failedLoginAttempts: 0,
        emailVerified: false,
      },
      status: 'active',
      // Always start as a standard customer regardless of provided role
      role: 'customer',
      // Provider application lifecycle starts at 'none'
      providerStatus: 'none',
      profileCompleted: false,
      onboardingCompleted: false,
      timezone: createUserDto.timezone || 'UTC',
      locale: createUserDto.locale || 'en',
    });
    
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return comparePassword(password, user.password);
  }

  sanitizeUser(user: User): Omit<User, 'password'> {
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...sanitizedUser } = userObj;
    // Convert MongoDB _id to string id for consistency with frontend
    return {
      ...sanitizedUser,
      id: (user as any)._id.toString(),
    };
  }

  // Additional methods for enhanced user management
  async updateUser(id: string, updateData: Partial<CreateUserDto>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async updateNotificationPreferences(id: string, preferences: Partial<any>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: { notificationPreferences: preferences } },
      { new: true }
    ).exec();
  }

  async updateSecuritySettings(id: string, securityData: Partial<any>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: { security: securityData } },
      { new: true }
    ).exec();
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $inc: { 'security.failedLoginAttempts': 1 },
    }).exec();
  }

  async resetFailedLoginAttempts(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: { 'security.failedLoginAttempts': 0, 'security.lockedUntil': null },
    }).exec();
  }

  async lockUser(id: string, lockUntil: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: { 'security.lockedUntil': lockUntil },
    }).exec();
  }

  async updateLastLogin(id: string, ip?: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        'security.lastLoginAt': new Date(),
        'security.lastLoginIP': ip,
      },
    }).exec();
  }

  async setEmailVerificationToken(id: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $set: { 'security.emailVerificationToken': token },
    }).exec();
  }

  async verifyEmail(token: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { 'security.emailVerificationToken': token },
      {
        $set: { 'security.emailVerified': true },
        $unset: { 'security.emailVerificationToken': 1 },
      },
      { new: true }
    ).exec();
  }

  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          'security.passwordResetToken': token,
          'security.passwordResetExpires': expires,
        },
      }
    ).exec();
  }

  async resetPassword(token: string, newPassword: string): Promise<User | null> {
    const hashedPassword = await hashPassword(newPassword);
    
    return this.userModel.findOneAndUpdate(
      {
        'security.passwordResetToken': token,
        'security.passwordResetExpires': { $gt: new Date() },
      },
      {
        $set: { password: hashedPassword },
        $unset: {
          'security.passwordResetToken': 1,
          'security.passwordResetExpires': 1,
        },
      },
      { new: true }
    ).exec();
  }

  async updatePhoneVerification(id: string, verificationData: Partial<any>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: { phoneVerification: verificationData } },
      { new: true }
    ).exec();
  }

  async enable2FA(id: string, secret: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        $set: {
          'security.twoFactorEnabled': true,
          'security.twoFactorSecret': secret,
        },
      },
      { new: true }
    ).exec();
  }

  async disable2FA(id: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      {
        $set: { 'security.twoFactorEnabled': false },
        $unset: { 'security.twoFactorSecret': 1 },
      },
      { new: true }
    ).exec();
  }

  async updatePassword(id: string, newPassword: string): Promise<User | null> {
    const hashedPassword = await hashPassword(newPassword);
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true }
    ).exec();
  }
}
