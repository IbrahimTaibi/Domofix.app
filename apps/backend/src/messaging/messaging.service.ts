import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Thread, ThreadDocument } from './schemas/thread.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { ListMessagesQueryDto } from './dto/list-messages.query';
import { ListThreadsQueryDto } from './dto/list-threads.query';
import { CreateThreadDto } from './dto/create-thread.dto';
import { NotificationsService } from '@/notifications/notifications.service';
import { AppLogger } from '@/common/logging/logger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Order,
  OrderDocument,
  OrderStatusEnum,
} from '@/orders/schemas/order.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';

@Injectable()
export class MessagingService {
  private rate: Map<string, number[]> = new Map(); // key: threadId:userId → timestamps

  constructor(
    @InjectModel(Thread.name)
    private readonly threadModel: Model<ThreadDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notifications: NotificationsService,
    private readonly logger: AppLogger,
    private readonly events: EventEmitter2,
  ) {}

  async createOrGetThread(
    orderId: string,
    participants: Array<{ userId: string; role: 'customer' | 'provider' }>,
  ) {
    const oid = new Types.ObjectId(orderId);
    const order = await this.orderModel.findById(oid);
    if (!order) throw new NotFoundException('Order not found');
    const exists = await this.threadModel.findOne({ orderId: oid });
    if (exists) return exists;
    const doc = await this.threadModel.create({
      orderId: oid,
      participants: participants.map((p) => ({
        userId: new Types.ObjectId(p.userId),
        role: p.role,
      })),
      status: 'open',
      lastMessageAt: null,
      unreadCounts: {},
    });
    return doc;
  }

  async listThreadsForUser(userId: string, query: ListThreadsQueryDto) {
    const uid = new Types.ObjectId(userId);
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const filter: any = { 'participants.userId': uid };
    if (query.status) filter.status = query.status;
    const [items, total] = await Promise.all([
      this.threadModel
        .find(filter)
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.threadModel.countDocuments(filter),
    ]);
    // collect unique userIds
    const ids = Array.from(
      new Set(
        items.flatMap((t: any) => t.participants.map((p: any) => String(p.userId)))
      )
    ).map((id) => new Types.ObjectId(id))
    const users = await this.userModel.find({ _id: { $in: ids } }).lean()
    const userMeta: Record<string, { name: string; avatar?: string }> = {}
    for (const u of users as any[]) {
      userMeta[String(u._id)] = { name: `${u.firstName} ${u.lastName}`.trim(), avatar: u.avatar || undefined }
    }
    return {
      data: items.map((t: any) => ({
        id: String(t._id),
        orderId: String(t.orderId),
        participants: t.participants.map((p: any) => ({
          userId: String(p.userId),
          role: p.role,
        })),
        status: t.status,
        lastMessageAt: t.lastMessageAt,
        unreadCounts: t.unreadCounts || {},
        participantMeta: userMeta,
      })),
      total,
      page,
      limit,
    };
  }

  private async ensureCanSend(threadId: string, senderId: string) {
    const tid = new Types.ObjectId(threadId);
    const sid = new Types.ObjectId(senderId);
    const thread = await this.threadModel.findById(tid);
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.status !== 'open')
      throw new ForbiddenException('Thread not open');
    if (!thread.participants.some((p) => p.userId.equals(sid)))
      throw new ForbiddenException('Not a participant');
    const order = await this.orderModel.findById(thread.orderId);
    if (!order) throw new NotFoundException('Order not found');
    // Gate by order status
    const status = order.status as any as OrderStatusEnum;
    if (status === 'canceled')
      throw new ForbiddenException('Messaging blocked for canceled order');
    if (status === 'completed') {
      const completedAt = (order as any).completedAt as Date | undefined;
      const graceDays = 7;
      if (
        !completedAt ||
        Date.now() - completedAt.getTime() > graceDays * 24 * 60 * 60 * 1000
      ) {
        throw new ForbiddenException('Messaging closed for completed order');
      }
    }
    // Rate limit: 30 messages / 5 minutes per thread per user
    const key = `${String(thread._id)}:${String(sid)}`;
    const now = Date.now();
    const windowMs = 5 * 60 * 1000;
    const arr = this.rate.get(key) || [];
    const recent = arr.filter((ts) => now - ts < windowMs);
    if (recent.length >= 30)
      throw new BadRequestException('Rate limit exceeded');
    recent.push(now);
    this.rate.set(key, recent);
    return thread;
  }

  async sendMessage(threadId: string, senderId: string, dto: SendMessageDto) {
    const thread = await this.ensureCanSend(threadId, senderId);
    // Validate attachments
    if (dto.kind === 'file') {
      const size = dto.fileSize || 0;
      const mime = dto.fileMime || '';
      if (size > 10 * 1024 * 1024)
        throw new BadRequestException('File too large');
      const allowed = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowed.includes(mime))
        throw new BadRequestException('Unsupported file type');
    }
    const msg = await this.messageModel.create({
      threadId: thread._id,
      senderId: new Types.ObjectId(senderId),
      kind: dto.kind,
      text: dto.text,
      imageUrl: dto.imageUrl,
      fileMeta:
        dto.kind === 'file'
          ? {
              name: dto.fileName || 'file',
              size: dto.fileSize || 0,
              mime: dto.fileMime || 'application/octet-stream',
            }
          : undefined,
      status: 'sent',
    });
    thread.lastMessageAt = msg.createdAt;
    const other = thread.participants.find(
      (p) => String(p.userId) !== String(senderId),
    );
    if (other) {
      const key = String(other.userId);
      thread.unreadCounts = thread.unreadCounts || {};
      thread.unreadCounts[key] = (thread.unreadCounts[key] || 0) + 1;
    }
    await thread.save();
    try {
      await this.notifications.create({
        userId: String(other?.userId || ''),
        title: 'Nouveau message',
        message:
          dto.kind === 'text'
            ? dto.text?.slice(0, 80) || 'Message'
            : 'Pièce jointe',
        severity: 'info',
        type: 'system.message',
        data: { threadId: String(thread._id), orderId: String(thread.orderId) },
      });
    } catch {}
    this.logger.info('MessageSent', { threadId: String(thread._id), senderId });
    const payload = {
      id: String(msg._id),
      threadId: String(msg.threadId),
      senderId: String(msg.senderId),
      kind: msg.kind,
      text: msg.text,
      imageUrl: msg.imageUrl,
      fileMeta: msg.fileMeta,
      status: msg.status,
      createdAt: msg.createdAt,
    };
    try { this.events.emit('message.sent', { threadId: String(thread._id), message: payload }) } catch {}
    return payload;
  }

  async listMessages(threadId: string, query: ListMessagesQueryDto) {
    const tid = new Types.ObjectId(threadId);
    const limit = Math.max(1, Math.min(200, Number(query.limit || 50)));
    const filter: any = { threadId: tid };
    if (query.before) filter.createdAt = { $lt: new Date(query.before) };
    const items = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const data = items.map((m: any) => ({
      id: String(m._id),
      threadId: String(m.threadId),
      senderId: String(m.senderId),
      kind: m.kind,
      text: m.text,
      imageUrl: m.imageUrl,
      fileMeta: m.fileMeta,
      status: m.status,
      createdAt: m.createdAt,
    }));
    const nextCursor = data.length
      ? data[data.length - 1].createdAt.toISOString()
      : null;
    return { data, nextCursor };
  }

  async markRead(threadId: string, userId: string) {
    const tid = new Types.ObjectId(threadId);
    const uid = new Types.ObjectId(userId);
    const thread = await this.threadModel.findById(tid);
    if (!thread) throw new NotFoundException('Thread not found');
    thread.unreadCounts = thread.unreadCounts || {};
    thread.unreadCounts[String(uid)] = 0;
    await thread.save();
    try { this.events.emit('message.read', { threadId: String(thread._id), userId: String(uid) }) } catch {}
    return { ok: true };
  }

  async isParticipant(threadId: string, userId: string): Promise<boolean> {
    const tid = new Types.ObjectId(threadId)
    const uid = new Types.ObjectId(userId)
    const thread = await this.threadModel.findById(tid)
    if (!thread) return false
    return thread.participants.some((p) => p.userId.equals(uid))
  }

  async archive(threadId: string, userId: string) {
    const tid = new Types.ObjectId(threadId);
    const uid = new Types.ObjectId(userId);
    const thread = await this.threadModel.findById(tid);
    if (!thread) throw new NotFoundException('Thread not found');
    if (!thread.participants.some((p) => p.userId.equals(uid)))
      throw new ForbiddenException('Not a participant');
    thread.status = 'archived';
    await thread.save();
    return { archived: true };
  }
}
