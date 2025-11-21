import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order, OrderDocument, OrderStatusEnum } from './schemas/order.schema';
import { AppLogger } from '@/common/logging/logger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly logger: AppLogger,
    private readonly events: EventEmitter2,
  ) {}

  async listForUser(
    userId: string,
    role: 'customer' | 'provider',
    filters: { status?: OrderStatusEnum; offset?: number; limit?: number } = {},
  ) {
    const base =
      role === 'customer'
        ? { customerId: new Types.ObjectId(userId) }
        : { providerId: new Types.ObjectId(userId) };
    const query = filters.status ? { ...base, status: filters.status } : base;
    let find = this.orderModel
      .find(query)
      .sort({ acceptedAt: -1 })
      .populate('requestId', 'category details phone address location')
      .populate('customerId', 'firstName lastName email avatar')
      .populate('providerId', 'firstName lastName email avatar')
      .populate('serviceId', 'title category');
    if (typeof filters.offset === 'number') find = find.skip(filters.offset);
    if (typeof filters.limit === 'number') find = find.limit(filters.limit);
    return find.exec();
  }

  async getByIdAuthorized(
    userId: string,
    role: 'customer' | 'provider' | 'admin',
    id: string,
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    const isCustomer = (order.customerId as any).toString() === userId;
    const isProvider = (order.providerId as any).toString() === userId;
    if (!isCustomer && !isProvider && role !== 'admin')
      throw new ForbiddenException('Not authorized to view this order');
    return order;
  }

  async startOrder(
    userId: string,
    role: 'customer' | 'provider' | 'admin',
    id: string,
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    if ((order.providerId as any).toString() !== userId && role !== 'admin')
      throw new ForbiddenException('Only assigned provider can start');
    if (order.status !== OrderStatusEnum.ASSIGNED)
      throw new BadRequestException('Order not in assigned state');
    order.status = OrderStatusEnum.IN_PROGRESS;
    order.startedAt = new Date();
    const updated = await order.save();
    this.logger.info('Order started', { orderId: id, providerId: userId });
    return updated;
  }

  async completeOrder(
    userId: string,
    role: 'customer' | 'provider' | 'admin',
    id: string,
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    const isCustomer = (order.customerId as any).toString() === userId;
    const isProvider = (order.providerId as any).toString() === userId;

    // Provider requests completion → pending_completion
    if (isProvider && role === 'provider') {
      if (order.status !== OrderStatusEnum.IN_PROGRESS)
        throw new BadRequestException('Only in-progress orders can be completed');
      order.status = OrderStatusEnum.PENDING_COMPLETION;
      order.completionRequestedAt = new Date();
      const updated = await order.save();
      this.logger.info('Order completion requested by provider', { orderId: id, providerId: userId });
      this.events.emit('order.completion_requested', { orderId: id });
      return updated;
    }

    // Customer or admin approves completion
    if (isCustomer || role === 'admin') {
      if (order.status !== OrderStatusEnum.PENDING_COMPLETION)
        throw new BadRequestException('Order must be pending completion');
      order.status = OrderStatusEnum.COMPLETED;
      order.completedAt = new Date();
      const updated = await order.save();
      this.logger.info('Order completed', { orderId: id, actorUserId: userId });
      this.events.emit('order.completed', { orderId: id });
      return updated;
    }

    throw new ForbiddenException('Not authorized to complete this order');
  }

  async setProviderEts(
    userId: string,
    role: 'provider' | 'admin',
    id: string,
    etsIso: string,
  ) {
    const etsDate = new Date(etsIso);
    if (!isFinite(etsDate.getTime()))
      throw new BadRequestException('Invalid ETS date');
    const now = Date.now();
    if (etsDate.getTime() <= now + 5 * 60 * 1000)
      throw new BadRequestException('ETS must be in the future');

    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    const isProvider = (order.providerId as any).toString() === userId;
    if (!isProvider && role !== 'admin')
      throw new ForbiddenException('Only assigned provider can set ETS');
    if (
      order.status === OrderStatusEnum.CANCELED ||
      order.status === OrderStatusEnum.COMPLETED
    ) {
      throw new BadRequestException('Cannot set ETS for finalized order');
    }
    order.providerEts = etsDate;
    const updated = await order.save();
    this.logger.info('Order ETS set', {
      orderId: id,
      providerId: userId,
      ets: etsIso,
    });
    return updated;
  }

  async cancelOrder(
    userId: string,
    role: 'customer' | 'provider' | 'admin',
    id: string,
  ) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    const isCustomer = (order.customerId as any).toString() === userId;
    if (!isCustomer && role !== 'admin')
      throw new ForbiddenException('Only the customer can cancel');
    if (
      order.status === OrderStatusEnum.COMPLETED ||
      order.status === OrderStatusEnum.CANCELED
    )
      throw new BadRequestException('Order already finalized');
    order.status = OrderStatusEnum.CANCELED;
    order.canceledAt = new Date();
    const updated = await order.save();
    this.logger.info('Order canceled', { orderId: id, customerId: userId });
    this.events.emit('order.canceled', { orderId: id });
    return updated;
  }

  /**
   * Auto-complete orders that have been pending completion for more than 3 days
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async autoCompleteExpiredOrders() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const expiredOrders = await this.orderModel
      .find({
        status: OrderStatusEnum.PENDING_COMPLETION,
        completionRequestedAt: { $lte: threeDaysAgo },
      })
      .exec();

    if (expiredOrders.length === 0) {
      this.logger.info('No expired orders to auto-complete');
      return [];
    }

    const results = [];
    for (const order of expiredOrders) {
      order.status = OrderStatusEnum.COMPLETED;
      order.completedAt = new Date();
      const updated = await order.save();
      this.logger.info('Order auto-completed after 3 days', { orderId: order._id.toString() });
      this.events.emit('order.completed', { orderId: order._id.toString() });
      results.push(updated);
    }

    this.logger.info(`Auto-completed ${results.length} expired orders`);
    return results;
  }
}
