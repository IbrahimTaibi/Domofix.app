import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokensService {
  constructor(@InjectModel(RefreshToken.name) private model: Model<RefreshTokenDocument>) {}

  async create(userId: string, jti: string, expiresAt: Date, meta?: { userAgent?: string; ip?: string }) {
    const doc = new this.model({ userId, jti, expiresAt, userAgent: meta?.userAgent ?? null, ip: meta?.ip ?? null });
    return doc.save();
  }

  async revokeByJti(userId: string, jti: string) {
    await this.model.updateOne({ userId, jti, revokedAt: null }, { $set: { revokedAt: new Date() } }).exec();
  }

  async revokeAllForUser(userId: string) {
    await this.model.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } }).exec();
  }

  async findActive(userId: string, jti: string): Promise<RefreshToken | null> {
    const now = new Date();
    return this.model.findOne({ userId, jti, revokedAt: null, expiresAt: { $gt: now } }).exec();
  }
}