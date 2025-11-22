import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProviderApplicationsModule } from './provider-applications/provider-applications.module';
import { ProviderServicesModule } from './provider-services/provider-services.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppLogger } from '@/common/logging/logger.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RequestsModule } from './requests/requests.module';
import { MonitoringService } from '@/common/monitoring/monitoring.service';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MessagingModule } from './messaging/messaging.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 60 seconds
        limit: 100, // 100 requests per minute (increased from 10)
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB_NAME'),
        retryWrites: true,
        serverSelectionTimeoutMS: Number(
          process.env.DB_SERVER_SELECTION_TIMEOUT_MS || '5000',
        ),
        maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE || '5'),
        autoIndex: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProviderApplicationsModule,
    ProviderServicesModule,
    RequestsModule,
    NotificationsModule,
    OrdersModule,
    ReviewsModule,
    MessagingModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AppLogger,
    MonitoringService,
  ],
})
export class AppModule {}
