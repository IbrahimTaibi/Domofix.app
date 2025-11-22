import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('provider', 'admin')
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.invoicesService.create(createInvoiceDto, userId);
  }

  @Get()
  async findAll(@Query() queryDto: QueryInvoiceDto, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'customer';
    return this.invoicesService.findAll(queryDto, userId, role);
  }

  @Get('statistics')
  async getStatistics(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'customer';
    return this.invoicesService.getStatistics(userId, role);
  }

  @Get('number/:invoiceNumber')
  async findByInvoiceNumber(
    @Param('invoiceNumber') invoiceNumber: string,
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'customer';
    return this.invoicesService.findByInvoiceNumber(
      invoiceNumber,
      userId,
      role,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'customer';
    return this.invoicesService.findOne(id, userId, role);
  }

  @Patch(':id')
  @Roles('provider', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'provider';
    return this.invoicesService.update(id, updateInvoiceDto, userId, role);
  }

  @Patch(':id/mark-paid')
  async markAsPaid(
    @Param('id') id: string,
    @Body() paymentInfo: any,
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'customer';
    return this.invoicesService.markAsPaid(id, paymentInfo, userId, role);
  }

  @Patch(':id/cancel')
  @Roles('provider', 'admin')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'provider';
    return this.invoicesService.cancel(id, userId, role);
  }

  @Delete(':id')
  @Roles('provider', 'admin')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const role = req.user?.role || 'provider';
    await this.invoicesService.remove(id, userId, role);
    return { message: 'Invoice deleted successfully' };
  }
}
