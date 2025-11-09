import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { Request as RequestEntity, RequestSchema } from '../requests/schemas/request.schema';
import { RequestToOrderListener } from './listeners/request-to-order.listener';
import { AppLogger } from '@/common/logging/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: RequestEntity.name, schema: RequestSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, RequestToOrderListener, AppLogger],
  exports: [OrdersService],
})
export class OrdersModule {}