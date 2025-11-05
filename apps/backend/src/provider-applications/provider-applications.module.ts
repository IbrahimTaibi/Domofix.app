import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProviderApplicationsController } from './provider-applications.controller';
import { ProviderApplicationsService } from './provider-applications.service';
import { ProviderApplication, ProviderApplicationSchema } from './schemas/provider-application.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: ProviderApplication.name, schema: ProviderApplicationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ProviderApplicationsController],
  providers: [ProviderApplicationsService],
  exports: [ProviderApplicationsService],
})
export class ProviderApplicationsModule {}