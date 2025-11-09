import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Notification, NotificationSchema } from './schemas/notification.schema'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { NotificationsSseController } from './notifications.sse.controller'
import { AppLogger } from '@/common/logging/logger.service'
import { NotificationsGateway } from './notifications.gateway'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationsService, AppLogger, NotificationsGateway],
  controllers: [NotificationsController, NotificationsSseController],
  exports: [NotificationsService],
})
export class NotificationsModule {}