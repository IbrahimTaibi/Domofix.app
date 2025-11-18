import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProviderServicesService } from './provider-services.service';
import { CreateProviderServiceDto } from './dto/create-provider-service.dto';
import { UpdateProviderServiceDto } from './dto/update-provider-service.dto';
import { QueryProviderServicesDto } from './dto/query-provider-services.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ServiceStatus } from './schemas/provider-service.schema';
import { AppLogger } from '../common/logging/logger.service';

@Controller('provider-services')
export class ProviderServicesController {
  constructor(
    private readonly service: ProviderServicesService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Create a new provider service
   * POST /provider-services
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Post()
  async create(@Req() req: any, @Body() dto: CreateProviderServiceDto) {
    const providerId = req.user?.userId || req.user?.sub || req.user?.id;
    this.logger.info('Creating provider service', { providerId, category: dto.category });
    return this.service.create(providerId, dto);
  }

  /**
   * Get all services for the authenticated provider
   * GET /provider-services/my-services
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Get('my-services')
  async getMyServices(@Req() req: any, @Query() query: QueryProviderServicesDto) {
    const providerId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.findByProvider(providerId, query);
  }

  /**
   * Get provider statistics
   * GET /provider-services/my-stats
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Get('my-stats')
  async getMyStats(@Req() req: any) {
    const providerId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.getProviderStats(providerId);
  }

  /**
   * Get services by category (public)
   * GET /provider-services/category/:category
   */
  @Get('category/:category')
  async getByCategory(
    @Param('category') category: string,
    @Query() query: QueryProviderServicesDto,
  ) {
    return this.service.findByCategory(category, query);
  }

  /**
   * Get a specific service by ID
   * GET /provider-services/:id
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const service = await this.service.findById(id);

    // Increment view count asynchronously
    this.service.incrementViewCount(id).catch(() => {
      // Silent fail
    });

    return service;
  }

  /**
   * Update a provider service
   * PATCH /provider-services/:id
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateProviderServiceDto,
  ) {
    const providerId = req.user?.userId || req.user?.sub || req.user?.id;
    this.logger.info('Updating provider service', { serviceId: id, providerId });
    return this.service.update(id, providerId, dto);
  }

  /**
   * Update service status
   * PATCH /provider-services/:id/status
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Req() req: any,
    @Body('status') status: ServiceStatus,
  ) {
    const providerId = req.user?.userId || req.user?.sub || req.user?.id;
    this.logger.info('Updating service status', { serviceId: id, providerId, status });
    return this.service.updateStatus(id, providerId, status);
  }

  /**
   * Delete a provider service
   * DELETE /provider-services/:id
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Req() req: any) {
    const providerId = req.user?.userId || req.user?.sub || req.user?.id;
    this.logger.info('Deleting provider service', { serviceId: id, providerId });
    await this.service.delete(id, providerId);
  }

  /**
   * Increment inquiry count
   * POST /provider-services/:id/inquire
   */
  @Post(':id/inquire')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementInquiryCount(@Param('id') id: string) {
    await this.service.incrementInquiryCount(id);
  }
}
