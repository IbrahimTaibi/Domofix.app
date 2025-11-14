import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Thread, ThreadSchema } from './schemas/thread.schema'
import { Message, MessageSchema } from './schemas/message.schema'
import { MessagingService } from './messaging.service'
import { MessagingController } from './messaging.controller'
import { NotificationsModule } from '@/notifications/notifications.module'
import { AppLogger } from '@/common/logging/logger.service'
import { Order, OrderSchema } from '@/orders/schemas/order.schema'
import { User, UserSchema } from '@/users/schemas/user.schema'
import { MessagingGateway } from './messaging.gateway'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService, AppLogger, MessagingGateway],
  exports: [MessagingService],
})
export class MessagingModule {}
