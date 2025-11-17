import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from '../email/email.service';
import { AppLogger } from '@/common/logging/logger.service';
import { AuthEventsListener } from './listeners/auth-events.listener';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { RefreshTokensService } from './refresh-tokens.service';

function ttlToSeconds(ttl: string): number {
  const match = ttl.match(/^(\d+)\s*(ms|s|m|h|d)$/);
  if (!match) {
    return 24 * 60 * 60; // default 24h
  }
  const num = parseInt(match[1], 10);
  const unit = match[2] as 'ms' | 's' | 'm' | 'h' | 'd';
  const map = { ms: 0.001, s: 1, m: 60, h: 3600, d: 86400 };
  const seconds = Math.floor(num * map[unit]);
  return seconds < 1 ? 1 : seconds;
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const accessTtl =
          configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
          configService.get<string>('JWT_EXPIRES_IN') ||
          '24h';
        return {
          secret:
            configService.get<string>('JWT_ACCESS_SECRET') ||
            configService.get<string>('JWT_SECRET') ||
            'your-secret-key',
          signOptions: {
            expiresIn: ttlToSeconds(accessTtl),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailService,
    RefreshTokensService,
    AppLogger,
    AuthEventsListener,
  ],
  exports: [AuthService, EmailService, RefreshTokensService],
})
export class AuthModule {}
