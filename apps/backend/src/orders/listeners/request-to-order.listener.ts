import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatusEnum } from '../schemas/order.schema';
import { Request as RequestEntity, RequestDocument } from '../../requests/schemas/request.schema';
import { AppLogger } from '@/common/logging/logger.service';

type RequestAcceptedPayload = { id: string; providerId: string };
type RequestCompletedPayload = { id: string };

@Injectable()
export class RequestToOrderListener {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(RequestEntity.name) private readonly requestModel: Model<RequestDocument>,
    private readonly logger: AppLogger,
  ) {}

  @OnEvent('request.accepted', { async: true })
  async handleRequestAccepted(payload: RequestAcceptedPayload) {
    try {
      const req = await this.requestModel.findById(payload.id).exec();
      if (!req) return;
      const existing = await this.orderModel.findOne({ requestId: req._id }).exec();
      if (existing) {
        // Idempotent update if provider changed
        existing.providerId = new Types.ObjectId(payload.providerId);
        existing.status = OrderStatusEnum.ASSIGNED;
        existing.acceptedAt = new Date();
        await existing.save();
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
      this.logger.info('Order created from accepted request', { requestId: payload.id, orderId: (order as any)._id.toString() });
    } catch (err: any) {
      this.logger.error('Failed to create order from request.accepted', { requestId: payload.id }, err?.stack);
    }
  }

  @OnEvent('request.completed', { async: true })
  async handleRequestCompleted(payload: RequestCompletedPayload) {
    try {
      const req = await this.requestModel.findById(payload.id).exec();
      if (!req) return;
      const order = await this.orderModel.findOne({ requestId: req._id }).exec();
      if (!order) return;
      order.status = OrderStatusEnum.COMPLETED;
      order.completedAt = new Date();
      await order.save();
      this.logger.info('Order marked completed from request', { requestId: payload.id, orderId: (order as any)._id.toString() });
    } catch (err: any) {
      this.logger.error('Failed to complete order from request.completed', { requestId: payload.id }, err?.stack);
    }
  }
}