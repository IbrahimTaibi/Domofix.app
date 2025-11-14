import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Review, ReviewSchema } from './schemas/review.schema'
import { Comment, CommentSchema } from './schemas/comment.schema'
import { ReviewsService } from './reviews.service'
import { ReviewsController } from './reviews.controller'
import { NotificationsModule } from '@/notifications/notifications.module'
import { AppLogger } from '@/common/logging/logger.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, AppLogger],
  exports: [ReviewsService],
})
export class ReviewsModule {}
