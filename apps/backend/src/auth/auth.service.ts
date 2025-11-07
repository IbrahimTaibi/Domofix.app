import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Address } from '../users/schemas/user.schema';
import { OAuthLoginDto } from './dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { isValidPassword } from '@darigo/shared-utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phoneNumber?: string;
    countryCode?: string;
    timezone?: string;
    locale?: string;
    role?: 'customer' | 'provider';
    address?: Address;
  }) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user (force standard customer role at registration)
    const user = await this.usersService.create({
      ...userData,
      role: 'customer',
    });

    // Fire-and-forget welcome email (do not block registration on send failures)
    try {
      await this.emailService.sendWelcomeEmail(user.email, (user as any).firstName);
    } catch (err) {
      // Intentionally swallow errors here to avoid breaking registration
    }
    
    // Generate JWT token
    const payload = { 
      sub: (user as any)._id.toString(), 
      email: user.email 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: this.usersService.sanitizeUser(user),
    };
  }

  /**
   * Issue a verification token and email it to the current user.
   */
  async requestEmailVerification(userId: string): Promise<{ ok: boolean }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const token = crypto.randomBytes(32).toString('hex');
    await this.usersService.setEmailVerificationToken((user as any)._id.toString(), token);
    await this.emailService.sendVerificationEmail(user.email, token);
    return { ok: true };
  }

  /**
   * Verify email using token (from link).
   */
  async verifyEmail(token: string) {
    const updated = await this.usersService.verifyEmail(token);
    if (!updated) throw new NotFoundException('Invalid or expired token');
    return this.usersService.sanitizeUser(updated);
  }

  /**
   * Send password reset email to provided address.
   */
  async forgotPassword(email: string): Promise<{ ok: boolean }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Do not reveal existence; respond OK
      return { ok: true };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.usersService.setPasswordResetToken(email, token, expires);
    await this.emailService.sendPasswordResetEmail(email, token);
    return { ok: true };
  }

  /**
   * Reset password using token and new password.
   */
  async resetPassword(token: string, newPassword: string) {
    if (!isValidPassword(newPassword)) {
      throw new BadRequestException('New password does not meet policy requirements');
    }
    const updated = await this.usersService.resetPassword(token, newPassword);
    if (!updated) throw new NotFoundException('Invalid or expired token');
    return this.usersService.sanitizeUser(updated);
  }

  async login(email: string, password: string, ip?: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login information
    if (ip) {
      await this.usersService.updateLastLogin((user as any)._id.toString(), ip);
    }

    // Reset failed login attempts on successful login
    await this.usersService.resetFailedLoginAttempts((user as any)._id.toString());

    const payload = { 
      sub: (user as any)._id.toString(), 
      email: user.email 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: this.usersService.sanitizeUser(user),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    // Check if user is locked
    if (user.security.lockedUntil && user.security.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked due to too many failed login attempts');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.usersService.incrementFailedLoginAttempts((user as any)._id.toString());
      
      // Lock account if too many failed attempts (e.g., 5 attempts)
      if (user.security.failedLoginAttempts >= 4) { // 4 because we just incremented
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 15); // Lock for 15 minutes
        await this.usersService.lockUser((user as any)._id.toString(), lockUntil);
      }
      
      return null;
    }

    return user;
  }

  /**
   * OAuth login/link: find existing user by email or create one, then issue JWT.
   */
  async oauthLogin(provider: 'facebook' | 'google', payload: OAuthLoginDto, ip?: string) {
    // Normalize email: if provider didn't supply email, synthesize one from providerId
    const normalizedEmail = payload.email || (payload.providerId ? `${provider}_${payload.providerId}@social.local` : undefined);
    if (!normalizedEmail) {
      // Without email or providerId we cannot link/create; reject gracefully
      throw new UnauthorizedException('OAuth payload missing email and providerId');
    }
    // Try find user by normalized email
    const existing = await this.usersService.findByEmail(normalizedEmail);

    let user = existing;
    if (!existing) {
      const { firstName, lastName } = this.extractNames(payload.firstName, payload.lastName);
      const randomPassword = this.generateRandomPassword();
      user = await this.usersService.create({
        email: normalizedEmail,
        password: randomPassword,
        firstName,
        lastName,
        avatar: payload.avatar,
        // Always start as standard customer
        role: 'customer',
      });
      // Optionally mark email verified or store provider metadata later
    } else {
      // If user exists and we received an avatar, update when missing or when current is a Facebook CDN URL (refresh to higher-res)
      const currentAvatar = (existing as any).avatar as string | undefined;
      const isFacebookAvatar = (url?: string) => !!url && /(facebook\.com|fbcdn\.net|fbsbx\.com)/i.test(url);
      const shouldUpdateAvatar = !!payload.avatar && (!currentAvatar || isFacebookAvatar(currentAvatar));
      if (shouldUpdateAvatar) {
        user = await this.usersService.updateUser(
          (existing as any)._id.toString(),
          { avatar: payload.avatar } as any,
        ) as any;
      }
    }

    // Update last login info
    if (ip && user) {
      await this.usersService.updateLastLogin((user as any)._id.toString(), ip);
      await this.usersService.resetFailedLoginAttempts((user as any)._id.toString());
    }

    const jwtPayload = {
      sub: (user as any)._id.toString(),
      email: (user as any).email,
    };

    return {
      access_token: this.jwtService.sign(jwtPayload),
      user: this.usersService.sanitizeUser(user as any),
      provider,
    };
  }

  private extractNames(firstName?: string, lastName?: string) {
    if (firstName || lastName) {
      return {
        firstName: firstName || 'Utilisateur',
        lastName: lastName || 'Social',
      };
    }
    // Fallback when only full name available or missing
    return { firstName: 'Utilisateur', lastName: 'Social' };
  }

  private generateRandomPassword() {
    // 32-char random string as placeholder password for OAuth-created users
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let pwd = '';
    for (let i = 0; i < 32; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
  }

  /**
   * Change password for an authenticated user.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentValid = await this.usersService.validatePassword(user as any, currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (!isValidPassword(newPassword)) {
      throw new BadRequestException('New password does not meet policy requirements');
    }

    const updated = await this.usersService.updatePassword((user as any)._id.toString(), newPassword);
    if (!updated) {
      throw new NotFoundException('Unable to update password');
    }
    return this.usersService.sanitizeUser(updated);
  }
}
