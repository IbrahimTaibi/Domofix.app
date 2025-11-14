import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Address } from '../../users/schemas/user.schema';

export type RequestDocument = Request & Document;

@Schema({ _id: false })
export class LocationSubdoc {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ default: null })
  address?: string;

  @Prop({ default: null })
  city?: string;

  @Prop({ default: null })
  state?: string;

  @Prop({ default: null })
  zipCode?: string;
}

@Schema({ _id: false })
export class RequestApplicationSubdoc {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  providerId: Types.ObjectId;

  @Prop({ default: null })
  message?: string;

  @Prop({ required: true, default: () => new Date() })
  appliedAt: Date;
}

export enum RequestStatusEnum {
  OPEN = 'open',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class Request {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerId: Types.ObjectId;

  // Address OR geolocation (address contains optional lat/long fields)
  @Prop({ type: Address, default: () => ({}) })
  address: Address;

  // Separate location subdocument for geospatial data
  @Prop({ type: LocationSubdoc, default: null })
  location?: LocationSubdoc | null;

  // GeoJSON point for geospatial queries
  @Prop({ type: Object, default: null })
  locationPoint?: { type: 'Point'; coordinates: [number, number] } | null;

  // Phone number for contact
  @Prop({ required: true })
  phone: string;

  // Service category from predefined list
  @Prop({ required: true, enum: [
    'plumber','barber','cleaner','tutor','delivery','electrician','carpenter','painter','gardener','other'
  ], index: true })
  category: string;

  // Estimated time of service (ETS)
  @Prop({ required: true })
  estimatedTimeOfService: Date;

  // Expiry notice sent timestamp (one hour before closure)
  @Prop({ default: null })
  expiryNoticeSentAt?: Date | null;

  // Additional service details
  @Prop({ default: null })
  details?: string;

  // Optional photos attached to the request
  @Prop({ type: [String], default: [] })
  photos: string[];

  // Lifecycle status
  @Prop({ required: true, enum: Object.values(RequestStatusEnum), default: RequestStatusEnum.OPEN, index: true })
  status: RequestStatusEnum;

  // Provider applications
  @Prop({ type: [RequestApplicationSubdoc], default: [] })
  applications: RequestApplicationSubdoc[];

  // Selected provider (one-to-one)
  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  acceptedProviderId?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const RequestApplicationSchema = SchemaFactory.createForClass(RequestApplicationSubdoc);
export const RequestSchema = SchemaFactory.createForClass(Request);

// Performance indexes
RequestSchema.index({ customerId: 1, status: 1, createdAt: -1 });
RequestSchema.index({ status: 1, createdAt: -1 });
RequestSchema.index({ acceptedProviderId: 1, status: 1 });
RequestSchema.index({ 'applications.providerId': 1 });
RequestSchema.index({ locationPoint: '2dsphere' });
