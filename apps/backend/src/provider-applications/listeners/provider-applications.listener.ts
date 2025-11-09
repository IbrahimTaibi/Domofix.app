import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../email/email.service';
import { AppLogger } from '@/common/logging/logger.service';

type ProviderApplicationCreatedPayload = { id: string; userId: string };

@Injectable()
export class ProviderApplicationsEventsListener {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly logger: AppLogger,
  ) {}

  @OnEvent('providerApplication.created', { async: true })
  async handleProviderApplicationCreated(payload: ProviderApplicationCreatedPayload) {
    try {
      const user = await this.usersService.findById(payload.userId);
      const toEmail = (user as any)?.email;
      if (!toEmail) {
        this.logger.warn('Skipping providerApplication.created email: no user email', {
          userId: payload.userId,
          applicationId: payload.id,
        });
        return;
      }
      await this.emailService.sendProviderApplicationReceivedEmail(toEmail, payload.id);
    } catch (err: any) {
      this.logger.error(
        'Failed to send provider application received email',
        { userId: payload.userId, applicationId: payload.id },
        err?.stack,
      );
    }
  }
}