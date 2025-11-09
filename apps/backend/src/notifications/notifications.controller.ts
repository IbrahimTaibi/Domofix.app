import { Controller, Get, Patch, Param, UseGuards, Req, Query, Delete, Post } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AppLogger } from '@/common/logging/logger.service'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService, private readonly logger: AppLogger) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any, @Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    const lim = Math.max(1, Math.min(Number(limit || 50), 200))
    const { data, nextCursor } = await this.service.listByUser(userId, lim, cursor)
    return { data, nextCursor }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    const notif = await this.service.markRead(userId, id)
    return notif
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-all-read')
  async markAllRead(@Req() req: any) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    const count = await this.service.markAllRead(userId)
    return { updated: count }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?._id?.toString?.()
    await this.service.delete(userId, id)
    return { deleted: true }
  }
}