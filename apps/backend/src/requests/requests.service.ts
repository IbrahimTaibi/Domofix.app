import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Request as RequestEntity, RequestDocument, RequestStatusEnum } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApplyForRequestDto } from './dto/apply-for-request.dto';
import { AcceptProviderDto } from './dto/accept-provider.dto';
import { UsersService } from '../users/users.service';
import { AppLogger } from '@/common/logging/logger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { executeWithRetry } from '@/common/db/retry.util';
import { runInTransaction } from '@/common/db/transaction.util';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(RequestEntity.name) private readonly requestModel: Model<RequestDocument>,
    private readonly usersService: UsersService,
    private readonly logger: AppLogger,
    private readonly events: EventEmitter2,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createRequest(customerId: string, dto: CreateRequestDto): Promise<RequestEntity> {
    const user = await executeWithRetry(() => this.usersService.findById(customerId));
    if (!user) throw new NotFoundException('User not found');
    if ((user as any).role !== 'customer') throw new ForbiddenException('Only customers can create requests');

    const doc = new this.requestModel({
      customerId: new Types.ObjectId(customerId),
      address: dto.address ? dto.address : {},
      location: dto.location
        ? {
            latitude: (dto as any).location.latitude,
            longitude: (dto as any).location.longitude,
            address: (dto as any).location.address || null,
            city: (dto as any).location.city || null,
            state: (dto as any).location.state || null,
            zipCode: (dto as any).location.zipCode || null,
          }
        : null,
      phone: dto.phone,
      category: dto.category,
      estimatedTimeOfService: new Date(dto.estimatedTimeOfService),
      details: dto.details ?? null,
      status: RequestStatusEnum.OPEN,
      applications: [],
      acceptedProviderId: null,
    });

    const saved = await executeWithRetry(() => doc.save());
    this.logger.info('Request created', { requestId: (saved as any)._id.toString(), customerId });
    this.events.emit('request.created', { id: (saved as any)._id.toString(), customerId });
    return saved;
  }

  async applyForRequest(providerId: string, requestId: string, dto: ApplyForRequestDto): Promise<RequestEntity> {
    const user = await executeWithRetry(() => this.usersService.findById(providerId));
    if (!user) throw new NotFoundException('User not found');
    if ((user as any).role !== 'provider') throw new ForbiddenException('Only providers can apply for requests');

    const req = await executeWithRetry(() => this.requestModel.findById(requestId).exec());
    if (!req) throw new NotFoundException('Request not found');
    if (req.status === RequestStatusEnum.ACCEPTED || req.status === RequestStatusEnum.COMPLETED || req.status === RequestStatusEnum.CLOSED) {
      throw new BadRequestException('Cannot apply to a request that is accepted or completed');
    }

    const alreadyApplied = (req.applications || []).some((a: any) => (a.providerId as any).toString() === providerId);
    if (alreadyApplied) throw new BadRequestException('Provider has already applied');

    req.applications.push({ providerId: new Types.ObjectId(providerId), message: dto.message ?? null, appliedAt: new Date() } as any);
    const previousStatus = req.status;
    if (req.status === RequestStatusEnum.OPEN) {
      req.status = RequestStatusEnum.PENDING;
    }
    const updated = await executeWithRetry(() => req.save());
    this.logger.info('Provider applied to request', { requestId, providerId });
    // Notify customer of a new application
    this.events.emit('request.application.created', { id: requestId, providerId });
    if (previousStatus !== updated.status && updated.status === RequestStatusEnum.PENDING) {
      this.events.emit('request.pending', { id: requestId });
    }
    return updated;
  }

  async acceptProvider(customerId: string, requestId: string, dto: AcceptProviderDto): Promise<RequestEntity> {
    const req = await executeWithRetry(() => this.requestModel.findById(requestId).exec());
    if (!req) throw new NotFoundException('Request not found');
    if ((req.customerId as any).toString() !== customerId) throw new ForbiddenException('Only the customer can accept a provider');
    if (req.status === RequestStatusEnum.ACCEPTED || req.status === RequestStatusEnum.COMPLETED || req.status === RequestStatusEnum.CLOSED) {
      throw new BadRequestException('Request already accepted or completed');
    }

    const providerApplied = (req.applications || []).some((a: any) => (a.providerId as any).toString() === dto.providerId);
    if (!providerApplied) throw new BadRequestException('Selected provider has not applied');

    const result = await runInTransaction(this.connection, async (session) => {
      const updated = await this.requestModel
        .findByIdAndUpdate(
          requestId,
          { $set: { acceptedProviderId: new Types.ObjectId(dto.providerId), status: RequestStatusEnum.ACCEPTED } },
          { new: true, session },
        )
        .exec();
      if (!updated) throw new NotFoundException('Request not found');
      return updated;
    });

    this.logger.info('Provider accepted for request', { requestId, providerId: dto.providerId, customerId });
    this.events.emit('request.accepted', { id: requestId, providerId: dto.providerId });
    return result as any;
  }

  async completeRequest(actorUserId: string, requestId: string): Promise<RequestEntity> {
    const req = await executeWithRetry(() => this.requestModel.findById(requestId).exec());
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== RequestStatusEnum.ACCEPTED) throw new BadRequestException('Only accepted requests can be completed');
    const isCustomer = (req.customerId as any).toString() === actorUserId;
    const isProvider = req.acceptedProviderId ? (req.acceptedProviderId as any).toString() === actorUserId : false;
    if (!isCustomer && !isProvider) throw new ForbiddenException('Only the customer or accepted provider can complete the request');

    const updated = await executeWithRetry(() => this.requestModel.findByIdAndUpdate(requestId, { $set: { status: RequestStatusEnum.COMPLETED } }, { new: true }).exec());
    this.logger.info('Request completed', { requestId, actorUserId });
    this.events.emit('request.completed', { id: requestId });
    return updated as any;
  }

  async addRequestPhotos(customerId: string, requestId: string, photoUrls: string[]): Promise<RequestEntity> {
    const req = await executeWithRetry(() => this.requestModel.findById(requestId).exec());
    if (!req) throw new NotFoundException('Request not found');
    if ((req.customerId as any).toString() !== customerId) throw new ForbiddenException('Only the customer can add photos');
    if (req.status === RequestStatusEnum.COMPLETED || req.status === RequestStatusEnum.CLOSED) {
      throw new BadRequestException('Cannot add photos to a completed or closed request');
    }

    const updatedPhotos = Array.isArray(req.photos) ? req.photos.concat(photoUrls) : photoUrls;
    const updated = await executeWithRetry(() => this.requestModel.findByIdAndUpdate(
      requestId,
      { $set: { photos: updatedPhotos } },
      { new: true },
    ).exec());
    this.logger.info('Request photos added', { requestId, count: photoUrls.length });
    return updated as any;
  }

  async listForCustomer(
    customerId: string,
    filters: { status?: RequestStatusEnum; offset?: number; limit?: number } = {},
  ) {
    const base = { customerId: new Types.ObjectId(customerId) };
    const query = filters.status ? { ...base, status: filters.status } : base;
    let find = this.requestModel.find(query).sort({ createdAt: -1 });
    if (typeof filters.offset === 'number') find = find.skip(filters.offset);
    if (typeof filters.limit === 'number') find = find.limit(filters.limit);
    return find.exec();
  }
}