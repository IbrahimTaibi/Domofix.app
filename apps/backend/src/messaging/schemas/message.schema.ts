import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true, index: true })
  threadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, enum: ['text', 'image', 'file'], required: true })
  kind: 'text' | 'image' | 'file';

  @Prop()
  text?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: Object })
  fileMeta?: { name: string; size: number; mime: string };

  @Prop({ type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' })
  status: 'sent' | 'delivered' | 'read';

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ threadId: 1, createdAt: -1 });
