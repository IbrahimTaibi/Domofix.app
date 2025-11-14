import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { MessagingService } from './messaging.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { CreateThreadDto } from './dto/create-thread.dto'
import { ListThreadsQueryDto } from './dto/list-threads.query'
import { SendMessageDto } from './dto/send-message.dto'
import { ListMessagesQueryDto } from './dto/list-messages.query'

@UseGuards(JwtAuthGuard)
@Controller('threads')
export class MessagingController {
  constructor(private readonly service: MessagingService) {}

  @Post()
  async createThread(@Req() req: any, @Body() dto: CreateThreadDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub
    return this.service.createOrGetThread(dto.orderId, dto.participants)
  }

  @Get()
  @SkipThrottle()
  async listThreads(@Req() req: any, @Query() query: ListThreadsQueryDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub
    return this.service.listThreadsForUser(userId, query)
  }

  @Get(':id/messages')
  @SkipThrottle()
  async listMessages(@Req() req: any, @Param('id') id: string, @Query() query: ListMessagesQueryDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub
    return this.service.listMessages(id, query)
  }

  @Post(':id/messages')
  async send(@Req() req: any, @Param('id') id: string, @Body() dto: SendMessageDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub
    return this.service.sendMessage(id, userId, dto)
  }

  @Post(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub
    return this.service.markRead(id, userId)
  }

  @Patch(':id/archive')
  async archive(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub
    return this.service.archive(id, userId)
  }
}
