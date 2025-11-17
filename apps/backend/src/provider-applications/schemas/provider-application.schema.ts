import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProviderApplicationDocument = ProviderApplication & Document;

@Schema({ timestamps: true })
export class ProviderApplication {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  documentUrl: string;

  @Prop({ default: null })
  notes?: string;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected', 'needs_info'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';

  createdAt: Date;
  updatedAt: Date;
}

export const ProviderApplicationSchema =
  SchemaFactory.createForClass(ProviderApplication);
ProviderApplicationSchema.index({ userId: 1, status: 1 });
