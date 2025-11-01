import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Address } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

    // Create new user
    const user = await this.usersService.create(userData);
    
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
}
