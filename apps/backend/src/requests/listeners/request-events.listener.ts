import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../email/email.service';
import { AppLogger } from '@/common/logging/logger.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Request as RequestEntity,
  RequestDocument,
} from '../schemas/request.schema';
import { NotificationsService } from '../../notifications/notifications.service';

type RequestCreatedPayload = { id: string; customerId: string };
type RequestClosedPayload = { id: string };
type RequestExpiringSoonPayload = { id: string };
type RequestApplicationCreatedPayload = { id: string; providerId: string };

@Injectable()
export class RequestEventsListener {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly logger: AppLogger,
    @InjectModel(RequestEntity.name)
    private readonly requestModel: Model<RequestDocument>,
    private readonly notifications: NotificationsService,
  ) {}

  private getCategoryLabel(cat?: string): string {
    const map: Record<string, string> = {
      plumber: 'plomberie',
      barber: 'coiffure',
      cleaner: 'nettoyage',
      tutor: 'cours',
      delivery: 'livraison',
      electrician: 'électricité',
      carpenter: 'menuiserie',
      painter: 'peinture',
      gardener: 'jardinage',
      other: 'service',
    };
    return map[(cat || '').toLowerCase()] || cat || 'service';
  }

  @OnEvent('request.application.created', { async: true })
  async handleRequestApplicationCreated(
    payload: RequestApplicationCreatedPayload,
  ) {
    try {
      const requestId = payload.id;
      const displayId = `R-${String(requestId).slice(-6).toUpperCase()}`;
      const req = await this.requestModel.findById(requestId).exec();
      if (!req) {
        this.logger.warn(
          'Skipping request.application.created email: request not found',
          { requestId },
        );
        return;
      }
      const customerId = (req.customerId as any)?.toString?.() || '';
      const customer = customerId
        ? await this.usersService.findById(customerId)
        : null;
      const toEmail = (customer as any)?.email;
      if (!toEmail) {
        this.logger.warn(
          'Skipping request.application.created email: no customer email',
          { requestId, customerId },
        );
        return;
      }
      const provider = await this.usersService
        .findById(payload.providerId)
        .catch(() => null);
      const providerName = provider
        ? `${provider?.firstName || ''} ${provider?.lastName || ''}`.trim()
        : undefined;
      await this.emailService.sendRequestNewApplicationEmail(
        toEmail,
        requestId,
        providerName,
      );
      // Real-time notification for customer
      await this.notifications.create({
        userId: customerId,
        title: 'Nouvelle candidature',
        message: `Un prestataire a postulé pour votre demande ${displayId}.`,
        severity: 'info',
        type: 'request.created',
        data: { requestId, displayId },
      });
    } catch (err: any) {
      this.logger.error(
        'Failed to send request.application.created email',
        { requestId: payload.id },
        err?.stack,
      );
    }
  }

  @OnEvent('request.created', { async: true })
  async handleRequestCreated(payload: RequestCreatedPayload) {
    try {
      const displayId = `R-${String(payload.id).slice(-6).toUpperCase()}`;
      const req = await this.requestModel.findById(payload.id).exec();
      const categoryLabel = this.getCategoryLabel((req as any)?.category);
      const user = await this.usersService.findById(payload.customerId);
      const toEmail = (user as any)?.email;
      if (!toEmail) {
        this.logger.warn('Skipping request.created email: no customer email', {
          customerId: payload.customerId,
          requestId: payload.id,
        });
        return;
      }
      await this.emailService.sendRequestCreatedEmail(toEmail, payload.id);
      await this.notifications.create({
        userId: payload.customerId,
        title: 'Demande créée',
        message: `Votre demande de ${categoryLabel} ${displayId} a été créée.`,
        severity: 'success',
        type: 'request.created',
        data: {
          requestId: payload.id,
          displayId,
          category: (req as any)?.category,
        },
      });
    } catch (err: any) {
      this.logger.error(
        'Failed to send request.created email',
        { customerId: payload.customerId, requestId: payload.id },
        err?.stack,
      );
    }
  }

  @OnEvent('request.closed', { async: true })
  async handleRequestClosed(payload: RequestClosedPayload) {
    try {
      const requestId = payload.id;
      const displayId = `R-${String(requestId).slice(-6).toUpperCase()}`;
      const req = await this.requestModel.findById(requestId).exec();
      const categoryLabel = this.getCategoryLabel((req as any)?.category);
      if (!req) {
        this.logger.warn('Skipping request.closed email: request not found', {
          requestId,
        });
        return;
      }
      const customerId = (req.customerId as any)?.toString?.() || '';
      const user = customerId
        ? await this.usersService.findById(customerId)
        : null;
      const toEmail = (user as any)?.email;
      if (!toEmail) {
        this.logger.warn('Skipping request.closed email: no customer email', {
          requestId,
          customerId,
        });
        return;
      }
      await this.emailService.sendRequestExpiredEmail(toEmail, requestId);
      await this.notifications.create({
        userId: customerId,
        title: 'Demande close',
        message: `Votre demande de ${categoryLabel} ${displayId} est désormais close.`,
        severity: 'warning',
        type: 'request.completed',
        data: { requestId, displayId, category: (req as any)?.category },
      });
    } catch (err: any) {
      this.logger.error(
        'Failed to send request.closed email',
        { requestId: payload.id },
        err?.stack,
      );
    }
  }

  @OnEvent('request.expiringSoon', { async: true })
  async handleRequestExpiringSoon(payload: RequestExpiringSoonPayload) {
    try {
      const requestId = payload.id;
      const displayId = `R-${String(requestId).slice(-6).toUpperCase()}`;
      const req = await this.requestModel.findById(requestId).exec();
      const categoryLabel = this.getCategoryLabel((req as any)?.category);
      if (!req) {
        this.logger.warn(
          'Skipping request.expiringSoon email: request not found',
          { requestId },
        );
        return;
      }
      const customerId = (req.customerId as any)?.toString?.() || '';
      const user = customerId
        ? await this.usersService.findById(customerId)
        : null;
      const toEmail = (user as any)?.email;
      if (!toEmail) {
        this.logger.warn(
          'Skipping request.expiringSoon email: no customer email',
          { requestId, customerId },
        );
        return;
      }
      await this.emailService.sendRequestExpiringSoonEmail(toEmail, requestId);
      await this.notifications.create({
        userId: customerId,
        title: 'Demande sur le point d’expirer',
        message: `Votre demande de ${categoryLabel} ${displayId} expirera bientôt.`,
        severity: 'warning',
        type: 'system.message',
        data: { requestId, displayId, category: (req as any)?.category },
      });
    } catch (err: any) {
      this.logger.error(
        'Failed to send request.expiringSoon email',
        { requestId: payload.id },
        err?.stack,
      );
    }
  }
}
