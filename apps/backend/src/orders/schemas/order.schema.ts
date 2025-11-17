import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatusEnum {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Request', required: true, index: true })
  requestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  providerId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(OrderStatusEnum),
    default: OrderStatusEnum.ASSIGNED,
    index: true,
  })
  status: OrderStatusEnum;

  @Prop({ required: true })
  acceptedAt: Date;

  @Prop({ default: null })
  startedAt?: Date | null;

  @Prop({ default: null })
  completedAt?: Date | null;

  @Prop({ default: null })
  canceledAt?: Date | null;

  // Provider-proposed estimated time of service for this order
  @Prop({ default: null })
  providerEts?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for dashboards
OrderSchema.index({ customerId: 1, status: 1, acceptedAt: -1 });
OrderSchema.index({ providerId: 1, status: 1, acceptedAt: -1 });
OrderSchema.index({ requestId: 1 });
