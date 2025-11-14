import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { ListReviewsQueryDto } from './dto/list-reviews.query'
import { CreateCommentDto } from './dto/create-comment.dto'
import { ListCommentsQueryDto } from './dto/list-comments.query'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    return this.service.create(userId, dto)
  }

  @Get()
  list(@Query() query: ListReviewsQueryDto) {
    return this.service.list(query)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id)
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    return this.service.update(id, userId, dto)
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    return this.service.delete(id, userId)
  }

  @Post(':id/comments')
  addComment(@Req() req: any, @Param('id') reviewId: string, @Body() dto: CreateCommentDto) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    return this.service.addComment(userId, { ...dto, reviewId })
  }

  @Get(':id/comments')
  listComments(@Param('id') reviewId: string, @Query() query: ListCommentsQueryDto) {
    return this.service.listComments(reviewId, query)
  }
}
