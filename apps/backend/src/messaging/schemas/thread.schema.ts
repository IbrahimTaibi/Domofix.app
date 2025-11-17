import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ThreadDocument = HydratedDocument<Thread>;

@Schema({ timestamps: true })
export class Thread {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['customer', 'provider'], required: true },
      },
    ],
    required: true,
  })
  participants: Array<{
    userId: Types.ObjectId;
    role: 'customer' | 'provider';
  }>;

  @Prop({
    type: String,
    enum: ['open', 'archived', 'blocked'],
    default: 'open',
    index: true,
  })
  status: 'open' | 'archived' | 'blocked';

  @Prop({ type: Date, default: null, index: true })
  lastMessageAt: Date | null;

  @Prop({ type: Object, default: {} })
  unreadCounts: Record<string, number>;

  createdAt: Date;
  updatedAt: Date;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);

ThreadSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });
ThreadSchema.index({ orderId: 1 }, { unique: false });
