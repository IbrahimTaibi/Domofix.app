import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatusEnum } from '../schemas/order.schema';
import {
  Request as RequestEntity,
  RequestDocument,
} from '../../requests/schemas/request.schema';
import { AppLogger } from '@/common/logging/logger.service';
import { MessagingService } from '../../messaging/messaging.service';

type RequestAcceptedPayload = { id: string; providerId: string };
type RequestCompletedPayload = { id: string };

@Injectable()
export class RequestToOrderListener {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(RequestEntity.name)
    private readonly requestModel: Model<RequestDocument>,
    private readonly logger: AppLogger,
    private readonly messagingService: MessagingService,
  ) {}

  @OnEvent('request.accepted', { async: true })
  async handleRequestAccepted(payload: RequestAcceptedPayload) {
    try {
      const req = await this.requestModel.findById(payload.id).exec();
      if (!req) return;
      const existing = await this.orderModel
        .findOne({ requestId: req._id })
        .exec();
      if (existing) {
        // Idempotent update if provider changed
        existing.providerId = new Types.ObjectId(payload.providerId);
        existing.status = OrderStatusEnum.ASSIGNED;
        existing.acceptedAt = new Date();
        await existing.save();

        // Ensure thread exists for the order
        try {
          await this.messagingService.createOrGetThread(
            (existing as any)._id.toString(),
            [
              { userId: req.customerId.toString(), role: 'customer' },
              { userId: payload.providerId, role: 'provider' },
            ],
          );
          this.logger.info('Thread ensured for existing order', {
            orderId: (existing as any)._id.toString(),
          });
        } catch (threadErr: any) {
          this.logger.error(
            'Failed to ensure thread for existing order',
            { orderId: (existing as any)._id.toString() },
            threadErr?.stack,
          );
        }

        return;
      }
      const order = new this.orderModel({
        requestId: req._id,
        customerId: req.customerId,
        providerId: new Types.ObjectId(payload.providerId),
        status: OrderStatusEnum.ASSIGNED,
        acceptedAt: new Date(),
      });
      await order.save();
      this.logger.info('Order created from accepted request', {
        requestId: payload.id,
        orderId: (order as any)._id.toString(),
      });

      // Automatically create a chat thread for customer and provider
      try {
        await this.messagingService.createOrGetThread(
          (order as any)._id.toString(),
          [
            { userId: req.customerId.toString(), role: 'customer' },
            { userId: payload.providerId, role: 'provider' },
          ],
        );
        this.logger.info('Thread created for order', {
          orderId: (order as any)._id.toString(),
        });
      } catch (threadErr: any) {
        this.logger.error(
          'Failed to create thread for order',
          { orderId: (order as any)._id.toString() },
          threadErr?.stack,
        );
      }
    } catch (err: any) {
      this.logger.error(
        'Failed to create order from request.accepted',
        { requestId: payload.id },
        err?.stack,
      );
    }
  }

  @OnEvent('request.completed', { async: true })
  async handleRequestCompleted(payload: RequestCompletedPayload) {
    try {
      const req = await this.requestModel.findById(payload.id).exec();
      if (!req) return;
      const order = await this.orderModel
        .findOne({ requestId: req._id })
        .exec();
      if (!order) return;
      order.status = OrderStatusEnum.COMPLETED;
      order.completedAt = new Date();
      await order.save();
      this.logger.info('Order marked completed from request', {
        requestId: payload.id,
        orderId: (order as any)._id.toString(),
      });
    } catch (err: any) {
      this.logger.error(
        'Failed to complete order from request.completed',
        { requestId: payload.id },
        err?.stack,
      );
    }
  }
}
