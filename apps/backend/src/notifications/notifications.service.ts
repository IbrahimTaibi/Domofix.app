import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification as NotificationModel,
  NotificationDocument,
} from './schemas/notification.schema';
import type { Notification as NotificationDTO } from '@darigo/shared-types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppLogger } from '@/common/logging/logger.service';

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  type: NotificationDTO['type'];
  data?: Record<string, unknown>;
};

@Injectable()
export class NotificationsService {
  private streams: Map<
    string,
    { next: (event: any) => void; close: () => void }
  > = new Map();

  constructor(
    @InjectModel(NotificationModel.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly events: EventEmitter2,
    private readonly logger: AppLogger,
  ) {}

  async create(input: CreateNotificationInput): Promise<NotificationDTO> {
    const doc = await this.notificationModel.create({
      userId: new Types.ObjectId(input.userId),
      title: input.title,
      message: input.message,
      severity: input.severity,
      type: input.type,
      data: input.data || {},
    });
    const notif = this.toEntity(doc);
    this.events.emit('notification.created', notif);
    // Push to live stream for the user if connected
    this.pushToUser(notif.userId, {
      event: 'notification',
      data: notif,
    });
    return notif;
  }

  async listByUser(
    userId: string,
    limit = 50,
    cursor?: string,
  ): Promise<{ data: NotificationDTO[]; nextCursor: string | null }> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (cursor) {
      // Use createdAt cursor for stable ordering
      query.createdAt = { $lt: new Date(cursor) };
    }
    const docs = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const data = docs.map((d: any) => this.toLeanEntity(d));
    const nextCursor =
      data.length === limit ? (data[data.length - 1]?.createdAt ?? null) : null;
    return {
      data,
      nextCursor: nextCursor ? new Date(nextCursor).toISOString() : null,
    };
  }

  async markRead(userId: string, id: string): Promise<NotificationDTO> {
    const doc = await this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: { readAt: new Date() } },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Notification not found');
    const notif = this.toEntity(doc);
    this.pushToUser(userId, {
      event: 'notification.read',
      data: { id: notif.id, readAt: notif.readAt },
    });
    this.events.emit('notification.read', {
      userId,
      id: notif.id,
      readAt: notif.readAt,
    });
    return notif;
  }

  async markAllRead(userId: string): Promise<number> {
    const res = await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), readAt: null },
      { $set: { readAt: new Date() } },
    );
    this.pushToUser(userId, { event: 'notifications.read_all' });
    this.events.emit('notifications.read_all', { userId });
    return res.modifiedCount || 0;
  }

  async delete(userId: string, id: string): Promise<void> {
    const res = await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    if (res.deletedCount) {
      this.pushToUser(userId, { event: 'notification.deleted', data: { id } });
      this.events.emit('notification.deleted', { userId, id });
    }
  }

  // SSE stream management
  registerStream(
    userId: string,
    sink: { next: (event: any) => void; close: () => void },
  ) {
    this.logger.info('Notifications SSE connected', { userId });
    this.streams.set(userId, sink);
    // Initial heartbeat to confirm connection
    sink.next({ event: 'heartbeat', data: { ts: Date.now() } });
  }

  closeStream(userId: string) {
    const s = this.streams.get(userId);
    if (s) {
      try {
        s.close();
      } catch {}
      this.streams.delete(userId);
      this.logger.info('Notifications SSE disconnected', { userId });
    }
  }

  private pushToUser(userId: string, event: any) {
    const s = this.streams.get(userId);
    if (s) s.next(event);
  }

  private toEntity(doc: NotificationDocument): NotificationDTO {
    return {
      id: (doc._id as any).toString(),
      userId: (doc.userId as any).toString(),
      title: doc.title,
      message: doc.message,
      severity: doc.severity,
      type: doc.type,
      data: doc.data,
      readAt: doc.readAt ? doc.readAt.toISOString() : null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toLeanEntity(d: any): NotificationDTO {
    return {
      id: d._id?.toString?.() ?? String(d._id),
      userId: d.userId?.toString?.() ?? String(d.userId),
      title: d.title,
      message: d.message,
      severity: d.severity,
      type: d.type,
      data: d.data || {},
      readAt: d.readAt ? new Date(d.readAt).toISOString() : null,
      createdAt: new Date(d.createdAt).toISOString(),
      updatedAt: new Date(d.updatedAt).toISOString(),
    };
  }
}
