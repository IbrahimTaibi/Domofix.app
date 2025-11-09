import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Request, RequestSchema } from './schemas/request.schema';
import { UsersModule } from '../users/users.module';
import { AppLogger } from '@/common/logging/logger.service';
import { AuthModule } from '../auth/auth.module';
import { RequestEventsListener } from './listeners/request-events.listener';
import { RequestExpirationService } from './expiration.service';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  controllers: [RequestsController],
  providers: [RequestsService, AppLogger, RequestEventsListener, RequestExpirationService],
  exports: [RequestsService],
})
export class RequestsModule {}