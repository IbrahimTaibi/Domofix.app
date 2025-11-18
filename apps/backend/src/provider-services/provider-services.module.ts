import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderServicesController } from './provider-services.controller';
import { ProviderServicesService } from './provider-services.service';
import {
  ProviderService,
  ProviderServiceSchema,
} from './schemas/provider-service.schema';
import { AppLogger } from '../common/logging/logger.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProviderService.name, schema: ProviderServiceSchema },
    ]),
    AuthModule,
  ],
  controllers: [ProviderServicesController],
  providers: [ProviderServicesService, AppLogger],
  exports: [ProviderServicesService],
})
export class ProviderServicesModule {}
