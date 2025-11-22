import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ListOrdersQueryDto } from './dto/list-orders.query';
import { StartOrderDto } from './dto/start-order.dto';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { SetEtsDto } from './dto/set-ets.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async list(@Req() req: any, @Query() query: ListOrdersQueryDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role === 'provider' ? 'provider' : 'customer';
    return this.service.listForUser(userId, role, {
      status: query.status,
      offset: query.offset,
      limit: query.limit,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async getById(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role =
      req.user?.role === 'provider'
        ? 'provider'
        : req.user?.role === 'admin'
          ? 'admin'
          : 'customer';
    return this.service.getByIdAuthorized(userId, role, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Patch(':id/start')
  async start(
    @Req() req: any,
    @Param('id') id: string,
    @Body() _dto: StartOrderDto,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role =
      req.user?.role === 'provider'
        ? 'provider'
        : req.user?.role === 'admin'
          ? 'admin'
          : 'customer';
    return this.service.startOrder(userId, role, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/complete')
  async complete(
    @Req() req: any,
    @Param('id') id: string,
    @Body() _dto: CompleteOrderDto,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role =
      req.user?.role === 'provider'
        ? 'provider'
        : req.user?.role === 'admin'
          ? 'admin'
          : 'customer';
    return this.service.completeOrder(userId, role, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Patch(':id/ets')
  async setEts(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: SetEtsDto,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role =
      req.user?.role === 'provider'
        ? 'provider'
        : req.user?.role === 'admin'
          ? 'admin'
          : 'customer';
    return this.service.setProviderEts(userId, role as any, id, dto.ets);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Patch(':id/decline-completion')
  async declineCompletion(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role === 'admin' ? 'admin' : 'customer';
    return this.service.declineCompletion(userId, role, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Patch(':id/cancel')
  async cancel(
    @Req() req: any,
    @Param('id') id: string,
    @Body() _dto: CancelOrderDto,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role === 'admin' ? 'admin' : 'customer';
    return this.service.cancelOrder(userId, role, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role === 'provider' ? 'provider' : req.user?.role === 'admin' ? 'admin' : 'customer';
    const status = body.status;

    // Map status to corresponding methods
    if (status === 'in_progress') {
      return this.service.startOrder(userId, role, id);
    } else if (status === 'completed') {
      return this.service.completeOrder(userId, role, id);
    } else if (status === 'canceled') {
      return this.service.cancelOrder(userId, role, id);
    } else {
      throw new BadRequestException('Invalid status');
    }
  }
}
