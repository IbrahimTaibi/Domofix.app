import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews.query';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments.query';
import type {
  Review as ReviewDTO,
  Comment as CommentDTO,
} from '@domofix/shared-types';
import {
  NotFoundError,
  AuthorizationError,
  DatabaseError,
} from '@/common/errors/app-error';
import { AppLogger } from '@/common/logging/logger.service';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly notifications: NotificationsService,
    private readonly logger: AppLogger,
  ) {}

  async create(authorUserId: string, dto: CreateReviewDto): Promise<ReviewDTO> {
    try {
      const doc = await this.reviewModel.create({
        bookingId: new Types.ObjectId(dto.bookingId),
        customerId: new Types.ObjectId(dto.customerId),
        providerId: new Types.ObjectId(dto.providerId),
        serviceId: new Types.ObjectId(dto.serviceId),
        rating: dto.rating,
        comment: dto.comment,
        images: dto.images || [],
      });
      const entity = this.toDTO(doc);
      this.logger.info('ReviewCreated', {
        reviewId: entity.id,
        providerId: entity.providerId,
      });

      // Update provider's average rating
      await this.updateProviderRating(dto.providerId);

      await this.safeNotify(entity.providerId, {
        title: 'New review',
        message: 'A new review was submitted',
        severity: 'info',
        type: 'system.message',
        data: { reviewId: entity.id, rating: entity.rating },
      });
      return entity;
    } catch (err) {
      throw new DatabaseError('Failed to create review', undefined, {
        cause: err,
      });
    }
  }

  private async updateProviderRating(providerId: string): Promise<void> {
    try {
      // Calculate average rating for this provider
      const result = await this.reviewModel.aggregate([
        { $match: { providerId: new Types.ObjectId(providerId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (result.length > 0) {
        const { averageRating, totalReviews } = result[0];
        await this.userModel.updateOne(
          { _id: new Types.ObjectId(providerId) },
          {
            $set: {
              averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
              totalReviews,
            },
          },
        );
        this.logger.info('Provider rating updated', {
          providerId,
          averageRating,
          totalReviews,
        });
      }
    } catch (err) {
      this.logger.error('Failed to update provider rating', {
        providerId,
        error: err,
      });
    }
  }

  async list(query: ListReviewsQueryDto): Promise<{
    data: ReviewDTO[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const filter: any = {};
    if (query.providerId)
      filter.providerId = new Types.ObjectId(query.providerId);
    if (query.serviceId) filter.serviceId = new Types.ObjectId(query.serviceId);
    if (query.customerId)
      filter.customerId = new Types.ObjectId(query.customerId);
    const sort = query.sortOrder === 'asc' ? 'createdAt' : '-createdAt';
    try {
      const [items, total] = await Promise.all([
        this.reviewModel
          .find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        this.reviewModel.countDocuments(filter),
      ]);
      const data = items.map((i) => this.toLeanDTO(i));
      return { data, total, page, limit };
    } catch (err) {
      throw new DatabaseError('Failed to list reviews', undefined, {
        cause: err,
      });
    }
  }

  async get(id: string): Promise<ReviewDTO> {
    try {
      const doc = await this.reviewModel.findById(new Types.ObjectId(id));
      if (!doc) throw new NotFoundError('Review not found');
      return this.toDTO(doc);
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new DatabaseError('Failed to fetch review', undefined, {
        cause: err,
      });
    }
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewDTO> {
    try {
      const doc = await this.reviewModel.findById(new Types.ObjectId(id));
      if (!doc) throw new NotFoundError('Review not found');
      if (doc.customerId.toString() !== userId)
        throw new AuthorizationError('Not allowed');
      if (dto.rating !== undefined) doc.rating = dto.rating;
      if (dto.comment !== undefined) doc.comment = dto.comment;
      if (dto.images !== undefined) doc.images = dto.images;
      await doc.save();
      const entity = this.toDTO(doc);
      this.logger.info('ReviewUpdated', { reviewId: entity.id });
      return entity;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof AuthorizationError)
        throw err;
      throw new DatabaseError('Failed to update review', undefined, {
        cause: err,
      });
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const doc = await this.reviewModel.findById(new Types.ObjectId(id));
      if (!doc) throw new NotFoundError('Review not found');
      if (doc.customerId.toString() !== userId)
        throw new AuthorizationError('Not allowed');
      await this.reviewModel.deleteOne({ _id: doc._id });
      await this.commentModel.deleteMany({ reviewId: doc._id });
      this.logger.info('ReviewDeleted', { reviewId: id });
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof AuthorizationError)
        throw err;
      throw new DatabaseError('Failed to delete review', undefined, {
        cause: err,
      });
    }
  }

  async addComment(
    authorUserId: string,
    dto: CreateCommentDto,
  ): Promise<CommentDTO> {
    const reviewId = new Types.ObjectId(dto.reviewId);
    const parentId = dto.parentCommentId
      ? new Types.ObjectId(dto.parentCommentId)
      : undefined;
    try {
      const doc = await this.commentModel.create({
        reviewId,
        parentCommentId: parentId,
        authorId: new Types.ObjectId(authorUserId),
        content: dto.content,
      });
      this.logger.info('CommentAdded', {
        reviewId: dto.reviewId,
        commentId: (doc._id as any).toString(),
      });
      return {
        id: (doc._id as any).toString(),
        reviewId: (doc.reviewId as any).toString(),
        parentCommentId: doc.parentCommentId
          ? (doc.parentCommentId as any).toString()
          : undefined,
        authorId: (doc.authorId as any).toString(),
        content: doc.content,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    } catch (err) {
      throw new DatabaseError('Failed to add comment', undefined, {
        cause: err,
      });
    }
  }

  async listComments(reviewId: string, query: ListCommentsQueryDto) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 20)));
    const filter: any = { reviewId: new Types.ObjectId(reviewId) };
    if (query.parentCommentId)
      filter.parentCommentId = new Types.ObjectId(query.parentCommentId);
    try {
      const [items, total] = await Promise.all([
        this.commentModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        this.commentModel.countDocuments(filter),
      ]);
      const data = items.map((i: any) => ({
        id: i._id?.toString?.() ?? String(i._id),
        reviewId: i.reviewId?.toString?.() ?? String(i.reviewId),
        parentCommentId: i.parentCommentId
          ? (i.parentCommentId?.toString?.() ?? String(i.parentCommentId))
          : undefined,
        authorId: i.authorId?.toString?.() ?? String(i.authorId),
        content: i.content,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      }));
      return { data, total, page, limit };
    } catch (err) {
      throw new DatabaseError('Failed to list comments', undefined, {
        cause: err,
      });
    }
  }

  private toDTO(doc: ReviewDocument): ReviewDTO {
    return {
      id: (doc._id as any).toString(),
      bookingId: (doc.bookingId as any).toString(),
      customerId: (doc.customerId as any).toString(),
      providerId: (doc.providerId as any).toString(),
      serviceId: (doc.serviceId as any).toString(),
      rating: doc.rating,
      comment: doc.comment,
      images: doc.images || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private toLeanDTO(d: any): ReviewDTO {
    return {
      id: d._id?.toString?.() ?? String(d._id),
      bookingId: d.bookingId?.toString?.() ?? String(d.bookingId),
      customerId: d.customerId?.toString?.() ?? String(d.customerId),
      providerId: d.providerId?.toString?.() ?? String(d.providerId),
      serviceId: d.serviceId?.toString?.() ?? String(d.serviceId),
      rating: d.rating,
      comment: d.comment,
      images: d.images || [],
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    };
  }

  private async safeNotify(
    userId: string,
    payload: {
      title: string;
      message: string;
      severity: 'info' | 'success' | 'warning' | 'error';
      type: any;
      data?: Record<string, unknown>;
    },
  ) {
    try {
      await this.notifications.create({ userId, ...payload });
    } catch {}
  }
}
