import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Thread, ThreadDocument } from '../schemas/thread.schema';
import { AppLogger } from '@/common/logging/logger.service';

type OrderStatusPayload = { orderId: string };

@Injectable()
export class OrderStatusListener {
  constructor(
    @InjectModel(Thread.name)
    private readonly threadModel: Model<ThreadDocument>,
    private readonly logger: AppLogger,
  ) {}

  @OnEvent('order.completed', { async: true })
  async handleOrderCompleted(payload: OrderStatusPayload) {
    try {
      const thread = await this.threadModel
        .findOne({ orderId: new Types.ObjectId(payload.orderId) })
        .exec();
      if (!thread) {
        this.logger.warn('No thread found for completed order', {
          orderId: payload.orderId,
        });
        return;
      }

      // Archive the thread when order is completed
      thread.status = 'archived';
      await thread.save();
      this.logger.info('Thread archived for completed order', {
        orderId: payload.orderId,
        threadId: (thread as any)._id.toString(),
      });
    } catch (err: any) {
      this.logger.error(
        'Failed to archive thread for completed order',
        { orderId: payload.orderId },
        err?.stack,
      );
    }
  }

  @OnEvent('order.canceled', { async: true })
  async handleOrderCanceled(payload: OrderStatusPayload) {
    try {
      const thread = await this.threadModel
        .findOne({ orderId: new Types.ObjectId(payload.orderId) })
        .exec();
      if (!thread) {
        this.logger.warn('No thread found for canceled order', {
          orderId: payload.orderId,
        });
        return;
      }

      // Archive the thread when order is canceled
      thread.status = 'archived';
      await thread.save();
      this.logger.info('Thread archived for canceled order', {
        orderId: payload.orderId,
        threadId: (thread as any)._id.toString(),
      });
    } catch (err: any) {
      this.logger.error(
        'Failed to archive thread for canceled order',
        { orderId: payload.orderId },
        err?.stack,
      );
    }
  }
}
