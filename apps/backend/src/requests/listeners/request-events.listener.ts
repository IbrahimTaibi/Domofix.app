import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../email/email.service';
import { AppLogger } from '@/common/logging/logger.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request as RequestEntity, RequestDocument } from '../schemas/request.schema';

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
    @InjectModel(RequestEntity.name) private readonly requestModel: Model<RequestDocument>,
  ) {}

  @OnEvent('request.application.created', { async: true })
  async handleRequestApplicationCreated(payload: RequestApplicationCreatedPayload) {
    try {
      const requestId = payload.id;
      const req = await this.requestModel.findById(requestId).exec();
      if (!req) {
        this.logger.warn('Skipping request.application.created email: request not found', { requestId });
        return;
      }
      const customerId = (req.customerId as any)?.toString?.() || '';
      const customer = customerId ? await this.usersService.findById(customerId) : null;
      const toEmail = (customer as any)?.email;
      if (!toEmail) {
        this.logger.warn('Skipping request.application.created email: no customer email', { requestId, customerId });
        return;
      }
      const provider = await this.usersService.findById(payload.providerId).catch(() => null);
      const providerName = provider ? `${(provider as any)?.firstName || ''} ${(provider as any)?.lastName || ''}`.trim() : undefined;
      await this.emailService.sendRequestNewApplicationEmail(toEmail, requestId, providerName);
    } catch (err: any) {
      this.logger.error('Failed to send request.application.created email', { requestId: payload.id }, err?.stack);
    }
  }

  @OnEvent('request.created', { async: true })
  async handleRequestCreated(payload: RequestCreatedPayload) {
    try {
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
      const req = await this.requestModel.findById(requestId).exec();
      if (!req) {
        this.logger.warn('Skipping request.closed email: request not found', { requestId });
        return;
      }
      const customerId = (req.customerId as any)?.toString?.() || '';
      const user = customerId ? await this.usersService.findById(customerId) : null;
      const toEmail = (user as any)?.email;
      if (!toEmail) {
        this.logger.warn('Skipping request.closed email: no customer email', { requestId, customerId });
        return;
      }
      await this.emailService.sendRequestExpiredEmail(toEmail, requestId);
    } catch (err: any) {
      this.logger.error('Failed to send request.closed email', { requestId: payload.id }, err?.stack);
    }
  }

  @OnEvent('request.expiringSoon', { async: true })
  async handleRequestExpiringSoon(payload: RequestExpiringSoonPayload) {
    try {
      const requestId = payload.id;
      const req = await this.requestModel.findById(requestId).exec();
      if (!req) {
        this.logger.warn('Skipping request.expiringSoon email: request not found', { requestId });
        return;
      }
      const customerId = (req.customerId as any)?.toString?.() || '';
      const user = customerId ? await this.usersService.findById(customerId) : null;
      const toEmail = (user as any)?.email;
      if (!toEmail) {
        this.logger.warn('Skipping request.expiringSoon email: no customer email', { requestId, customerId });
        return;
      }
      await this.emailService.sendRequestExpiringSoonEmail(toEmail, requestId);
    } catch (err: any) {
      this.logger.error('Failed to send request.expiringSoon email', { requestId: payload.id }, err?.stack);
    }
  }
}