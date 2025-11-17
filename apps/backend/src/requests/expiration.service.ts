import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Request as RequestEntity,
  RequestDocument,
  RequestStatusEnum,
} from './schemas/request.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppLogger } from '@/common/logging/logger.service';
import { executeWithRetry } from '@/common/db/retry.util';

@Injectable()
export class RequestExpirationService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel(RequestEntity.name)
    private readonly requestModel: Model<RequestDocument>,
    private readonly events: EventEmitter2,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    const disabled =
      process.env.DISABLE_REQUEST_EXPIRY === 'true' ||
      process.env.NODE_ENV === 'test';
    if (disabled) return;
    const intervalMs = Number(
      process.env.REQUEST_EXPIRY_INTERVAL_MS || '60000',
    );
    this.timer = setInterval(() => {
      this.processExpiry().catch((err) => {
        this.logger.error('Request expiry tick failed', {}, err?.stack);
      });
    }, intervalMs);
    this.logger.info('Request expiration service started', { intervalMs });
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async processExpiry() {
    const now = new Date();
    const oneHourMs = 60 * 60 * 1000;
    const closureThreshold = new Date(now.getTime() - oneHourMs);

    // Send expiring-soon notices at ETS when not yet sent
    const noticeCandidates = await executeWithRetry(() =>
      this.requestModel
        .find({
          status: { $in: [RequestStatusEnum.OPEN, RequestStatusEnum.PENDING] },
          estimatedTimeOfService: { $lte: now },
          $or: [
            { expiryNoticeSentAt: null },
            { expiryNoticeSentAt: { $exists: false } },
          ],
        })
        .exec(),
    );
    for (const req of noticeCandidates) {
      try {
        req.expiryNoticeSentAt = now;
        await executeWithRetry(() => req.save());
        this.logger.info('Request expiring soon notice sent', {
          requestId: (req as any)._id.toString(),
        });
        this.events.emit('request.expiringSoon', {
          id: (req as any)._id.toString(),
        });
      } catch (err: any) {
        this.logger.error(
          'Failed to mark/send expiring notice',
          { requestId: (req as any)._id?.toString?.() },
          err?.stack,
        );
      }
    }

    // Close requests one hour after ETS if still not accepted/completed
    const closeCandidates = await executeWithRetry(() =>
      this.requestModel
        .find({
          status: { $in: [RequestStatusEnum.OPEN, RequestStatusEnum.PENDING] },
          estimatedTimeOfService: { $lte: closureThreshold },
        })
        .exec(),
    );
    for (const req of closeCandidates) {
      try {
        req.status = RequestStatusEnum.CLOSED;
        await executeWithRetry(() => req.save());
        this.logger.info('Request closed due to ETS+1h passed', {
          requestId: (req as any)._id.toString(),
        });
        this.events.emit('request.closed', { id: (req as any)._id.toString() });
      } catch (err: any) {
        this.logger.error(
          'Failed to close expired request',
          { requestId: (req as any)._id?.toString?.() },
          err?.stack,
        );
      }
    }
  }
}
