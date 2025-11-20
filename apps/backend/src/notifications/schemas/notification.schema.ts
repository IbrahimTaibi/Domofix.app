import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import type { NotificationType } from '@domofix/shared-types';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  })
  severity: 'info' | 'success' | 'warning' | 'error';

  @Prop({
    required: true,
    enum: [
      'request.created',
      'request.accepted',
      'request.completed',
      'provider.application.created',
      'provider.application.updated',
      'system.message',
    ],
    index: true,
  })
  type: NotificationType;

  @Prop({ type: Object, default: {} })
  data: Record<string, unknown>;

  @Prop({ default: null, index: true })
  readAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for query performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, readAt: 1 });
