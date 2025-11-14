import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { GeocodingService } from '@/common/geocoding/geocoding.service'
import { RequestsService } from './requests.service';
import { Request, RequestSchema } from './schemas/request.schema';
import { UsersModule } from '../users/users.module';
import { AppLogger } from '@/common/logging/logger.service';
import { AuthModule } from '../auth/auth.module';
import { RequestEventsListener } from './listeners/request-events.listener';
import { RequestExpirationService } from './expiration.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    NotificationsModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  controllers: [RequestsController],
  providers: [RequestsService, AppLogger, RequestEventsListener, RequestExpirationService, GeocodingService],
  exports: [RequestsService],
})
export class RequestsModule {}
