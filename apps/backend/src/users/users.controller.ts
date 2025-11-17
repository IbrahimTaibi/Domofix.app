import {
  Body,
  Controller,
  Patch,
  UseGuards,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user id');
    }

    const { notificationPreferences, ...rest } = body || {};

    let updated = null as any;

    // If notificationPreferences provided, update them first to avoid overwriting
    if (
      notificationPreferences &&
      Object.keys(notificationPreferences).length > 0
    ) {
      updated = await this.usersService.updateNotificationPreferences(
        userId,
        notificationPreferences,
      );
    }

    if (rest && Object.keys(rest).length > 0) {
      updated = await this.usersService.updateUser(userId, rest);
    }

    if (!updated) {
      // Nothing was updated, try to return current user
      const current = await this.usersService.findById(userId);
      if (!current) {
        throw new NotFoundException('User not found');
      }
      return this.usersService.sanitizeUser(current);
    }

    return this.usersService.sanitizeUser(updated);
  }
}
