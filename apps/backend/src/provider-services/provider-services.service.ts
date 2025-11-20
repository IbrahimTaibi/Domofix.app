import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ProviderService,
  ProviderServiceDocument,
  ServiceStatus,
  PricingType,
} from './schemas/provider-service.schema';
import { CreateProviderServiceDto } from './dto/create-provider-service.dto';
import { UpdateProviderServiceDto } from './dto/update-provider-service.dto';
import { QueryProviderServicesDto } from './dto/query-provider-services.dto';
import {
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from '../common/errors/app-error';
import { executeWithRetry } from '../common/db/retry.util';
import { AppLogger } from '../common/logging/logger.service';

export interface PaginatedServicesResponse {
  data: ProviderServiceDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProviderServicesService {
  constructor(
    @InjectModel(ProviderService.name)
    private serviceModel: Model<ProviderServiceDocument>,
    private readonly events: EventEmitter2,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Create a new provider service
   */
  async create(
    providerId: string,
    dto: CreateProviderServiceDto,
  ): Promise<ProviderServiceDocument> {
    try {
      // Validate pricing based on pricing type
      this.validatePricing(dto);

      const service = new this.serviceModel({
        ...dto,
        providerId: new Types.ObjectId(providerId),
        status: dto.status || ServiceStatus.DRAFT,
      });

      const saved = await executeWithRetry(() => service.save());

      this.logger.info('Provider service created', {
        serviceId: saved._id.toString(),
        providerId,
        category: dto.category,
      });

      this.events.emit('providerService.created', {
        id: saved._id.toString(),
        providerId,
        title: saved.title,
        category: saved.category,
      });

      return saved;
    } catch (error) {
      this.logger.error(
        'Failed to create provider service',
        { providerId, category: dto.category },
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Find all services for a provider with pagination
   */
  async findByProvider(
    providerId: string,
    query: QueryProviderServicesDto,
  ): Promise<PaginatedServicesResponse> {
    try {
      const page = parseInt(query.page || '1', 10);
      const limit = Math.min(parseInt(query.limit || '20', 10), 100);
      const skip = (page - 1) * limit;

      const filter: any = { providerId: new Types.ObjectId(providerId) };

      if (query.category) {
        filter.category = query.category;
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.search) {
        filter.$or = [
          { title: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } },
          { tags: { $in: [new RegExp(query.search, 'i')] } },
        ];
      }

      const [data, total] = await Promise.all([
        executeWithRetry(() =>
          this.serviceModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        ),
        executeWithRetry(() => this.serviceModel.countDocuments(filter).exec()),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch provider services',
        { providerId },
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Find all active services by category (public)
   */
  async findByCategory(
    category: string,
    query: QueryProviderServicesDto,
  ): Promise<PaginatedServicesResponse> {
    try {
      const page = parseInt(query.page || '1', 10);
      const limit = Math.min(parseInt(query.limit || '20', 10), 100);
      const skip = (page - 1) * limit;

      const filter: any = {
        category,
        status: ServiceStatus.ACTIVE,
      };

      if (query.search) {
        filter.$or = [
          { title: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } },
          { tags: { $in: [new RegExp(query.search, 'i')] } },
        ];
      }

      const [data, total] = await Promise.all([
        executeWithRetry(() =>
          this.serviceModel
            .find(filter)
            .populate('providerId', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
        ),
        executeWithRetry(() => this.serviceModel.countDocuments(filter).exec()),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch services by category',
        { category },
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Find a service by ID
   */
  async findById(id: string): Promise<ProviderServiceDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new ValidationError('ID de service invalide');
      }

      const service = await executeWithRetry(() =>
        this.serviceModel.findById(id).exec(),
      );

      if (!service) {
        throw new NotFoundError('Service non trouvé');
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      this.logger.error('Failed to fetch service', { id }, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Update a provider service
   */
  async update(
    id: string,
    providerId: string,
    dto: UpdateProviderServiceDto,
  ): Promise<ProviderServiceDocument> {
    try {
      const service = await this.findById(id);

      // Verify ownership
      if (service.providerId.toString() !== providerId) {
        throw new AuthorizationError(
          'Vous n\'êtes pas autorisé à modifier ce service',
        );
      }

      // Validate pricing if being updated
      const updateDto = dto as Partial<CreateProviderServiceDto>;
      if (updateDto.pricingType || updateDto.basePrice !== undefined || updateDto.minPrice !== undefined || updateDto.maxPrice !== undefined) {
        this.validatePricing({
          pricingType: updateDto.pricingType || service.pricingType,
          basePrice: updateDto.basePrice !== undefined ? updateDto.basePrice : service.basePrice,
          minPrice: updateDto.minPrice !== undefined ? updateDto.minPrice : service.minPrice,
          maxPrice: updateDto.maxPrice !== undefined ? updateDto.maxPrice : service.maxPrice,
        } as CreateProviderServiceDto);
      }

      Object.assign(service, dto);
      const updated = await executeWithRetry(() => service.save());

      this.logger.info('Provider service updated', {
        serviceId: id,
        providerId,
      });

      this.events.emit('providerService.updated', {
        id,
        providerId,
        changes: Object.keys(dto),
      });

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }
      this.logger.error('Failed to update service', { id, providerId }, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Delete a provider service
   */
  async delete(id: string, providerId: string): Promise<void> {
    try {
      const service = await this.findById(id);

      // Verify ownership
      if (service.providerId.toString() !== providerId) {
        throw new AuthorizationError(
          'Vous n\'êtes pas autorisé à supprimer ce service',
        );
      }

      await executeWithRetry(() => this.serviceModel.findByIdAndDelete(id).exec());

      this.logger.info('Provider service deleted', {
        serviceId: id,
        providerId,
      });

      this.events.emit('providerService.deleted', {
        id,
        providerId,
        title: service.title,
      });
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }
      this.logger.error('Failed to delete service', { id, providerId }, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Update service status
   */
  async updateStatus(
    id: string,
    providerId: string,
    status: ServiceStatus,
  ): Promise<ProviderServiceDocument> {
    try {
      const service = await this.findById(id);

      // Verify ownership
      if (service.providerId.toString() !== providerId) {
        throw new AuthorizationError(
          'Vous n\'êtes pas autorisé à modifier ce service',
        );
      }

      service.status = status;
      const updated = await executeWithRetry(() => service.save());

      this.logger.info('Provider service status updated', {
        serviceId: id,
        providerId,
        status,
      });

      this.events.emit('providerService.statusChanged', {
        id,
        providerId,
        status,
      });

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error;
      }
      this.logger.error(
        'Failed to update service status',
        { id, providerId, status },
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await executeWithRetry(() =>
        this.serviceModel
          .findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
          .exec(),
      );
    } catch (error) {
      // Silent fail for analytics
      this.logger.warn('Failed to increment view count', { id });
    }
  }

  /**
   * Increment inquiry count
   */
  async incrementInquiryCount(id: string): Promise<void> {
    try {
      await executeWithRetry(() =>
        this.serviceModel
          .findByIdAndUpdate(id, { $inc: { inquiryCount: 1 } })
          .exec(),
      );
    } catch (error) {
      // Silent fail for analytics
      this.logger.warn('Failed to increment inquiry count', { id });
    }
  }

  /**
   * Validate pricing based on pricing type
   */
  private validatePricing(dto: CreateProviderServiceDto | any): void {
    switch (dto.pricingType) {
      case PricingType.FIXED:
      case PricingType.HOURLY:
        if (dto.basePrice === undefined || dto.basePrice === null) {
          throw new ValidationError(
            `Le prix de base est requis pour le type de tarification ${dto.pricingType}`,
          );
        }
        if (dto.basePrice < 0) {
          throw new ValidationError('Le prix de base doit être positif');
        }
        break;

      case PricingType.RANGE:
        if (dto.minPrice === undefined || dto.minPrice === null) {
          throw new ValidationError(
            'Le prix minimum est requis pour une fourchette de prix',
          );
        }
        if (dto.maxPrice === undefined || dto.maxPrice === null) {
          throw new ValidationError(
            'Le prix maximum est requis pour une fourchette de prix',
          );
        }
        if (dto.minPrice < 0 || dto.maxPrice < 0) {
          throw new ValidationError('Les prix doivent être positifs');
        }
        if (dto.minPrice > dto.maxPrice) {
          throw new ValidationError(
            'Le prix minimum ne peut pas être supérieur au prix maximum',
          );
        }
        break;

      case PricingType.NEGOTIABLE:
        // No validation needed for negotiable
        break;

      default:
        throw new ValidationError('Type de tarification invalide');
    }
  }

  /**
   * Get statistics for a provider
   */
  async getProviderStats(providerId: string): Promise<any> {
    try {
      const stats = await executeWithRetry(() =>
        this.serviceModel.aggregate([
          { $match: { providerId: new Types.ObjectId(providerId) } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalViews: { $sum: '$viewCount' },
              totalInquiries: { $sum: '$inquiryCount' },
            },
          },
        ]).exec(),
      );

      const total = await executeWithRetry(() =>
        this.serviceModel.countDocuments({ providerId: new Types.ObjectId(providerId) }).exec(),
      );

      return {
        total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalViews: stat.totalViews,
            totalInquiries: stat.totalInquiries,
          };
          return acc;
        }, {}),
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch provider stats',
        { providerId },
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
