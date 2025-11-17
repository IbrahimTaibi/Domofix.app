import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../email/email.service';
import { AppLogger } from '@/common/logging/logger.service';

type UserRegisteredPayload = { id: string; email: string; firstName?: string };
type VerificationRequestedPayload = { email: string; token: string };

@Injectable()
export class AuthEventsListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: AppLogger,
  ) {}

  @OnEvent('user.registered', { async: true })
  async handleUserRegistered(payload: UserRegisteredPayload) {
    try {
      await this.emailService.sendWelcomeEmail(
        payload.email,
        payload.firstName,
      );
    } catch (err: any) {
      this.logger.error(
        'Failed to send welcome email',
        { userId: payload.id },
        err?.stack,
      );
    }
  }

  @OnEvent('user.verification.requested', { async: true })
  async handleVerificationRequested(payload: VerificationRequestedPayload) {
    try {
      await this.emailService.sendVerificationEmail(
        payload.email,
        payload.token,
      );
    } catch (err: any) {
      this.logger.error(
        'Failed to send verification email',
        { email: payload.email },
        err?.stack,
      );
    }
  }
}
