import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true, index: true })
  jti: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ default: null })
  userAgent?: string;

  @Prop({ default: null })
  ip?: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: null })
  revokedAt?: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ userId: 1, jti: 1 }, { unique: true });
RefreshTokenSchema.index({ expiresAt: 1 });
