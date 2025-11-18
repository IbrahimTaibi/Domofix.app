import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProviderServiceDocument = ProviderService & Document;

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export enum PricingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  RANGE = 'range',
  NEGOTIABLE = 'negotiable',
}

@Schema({ timestamps: true })
export class ProviderService {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  providerId: Types.ObjectId;

  @Prop({ required: true, minlength: 3, maxlength: 100 })
  title: string;

  @Prop({ required: true, minlength: 10, maxlength: 2000 })
  description: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({
    required: true,
    enum: Object.values(PricingType),
    default: PricingType.FIXED,
  })
  pricingType: PricingType;

  @Prop({ required: false, min: 0 })
  basePrice?: number;

  @Prop({ required: false, min: 0 })
  minPrice?: number;

  @Prop({ required: false, min: 0 })
  maxPrice?: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    required: true,
    enum: Object.values(ServiceStatus),
    default: ServiceStatus.DRAFT,
    index: true,
  })
  status: ServiceStatus;

  @Prop({ default: 0, min: 0 })
  viewCount: number;

  @Prop({ default: 0, min: 0 })
  inquiryCount: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const ProviderServiceSchema =
  SchemaFactory.createForClass(ProviderService);

// Compound indexes for efficient queries
ProviderServiceSchema.index({ providerId: 1, status: 1, createdAt: -1 });
ProviderServiceSchema.index({ category: 1, status: 1, createdAt: -1 });
ProviderServiceSchema.index({ providerId: 1, category: 1 });

// Virtual for price display
ProviderServiceSchema.virtual('priceDisplay').get(function (this: ProviderServiceDocument) {
  switch (this.pricingType) {
    case PricingType.FIXED:
      return this.basePrice ? `${this.basePrice} DT` : 'Prix non défini';
    case PricingType.HOURLY:
      return this.basePrice ? `${this.basePrice} DT/h` : 'Prix non défini';
    case PricingType.RANGE:
      return this.minPrice && this.maxPrice
        ? `${this.minPrice}-${this.maxPrice} DT`
        : 'Prix non défini';
    case PricingType.NEGOTIABLE:
      return 'Négociable';
    default:
      return 'Prix non défini';
  }
});

ProviderServiceSchema.set('toJSON', { virtuals: true });
ProviderServiceSchema.set('toObject', { virtuals: true });
