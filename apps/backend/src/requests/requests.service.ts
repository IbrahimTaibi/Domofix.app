import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import {
  Request as RequestEntity,
  RequestDocument,
  RequestStatusEnum,
} from './schemas/request.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApplyForRequestDto } from './dto/apply-for-request.dto';
import { AcceptProviderDto } from './dto/accept-provider.dto';
import { UsersService } from '../users/users.service';
import { AppLogger } from '@/common/logging/logger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { executeWithRetry } from '@/common/db/retry.util';
import { runInTransaction } from '@/common/db/transaction.util';
import { GeocodingService } from '@/common/geocoding/geocoding.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(RequestEntity.name)
    private readonly requestModel: Model<RequestDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly usersService: UsersService,
    private readonly logger: AppLogger,
    private readonly events: EventEmitter2,
    @InjectConnection() private readonly connection: Connection,
    private readonly geocoding: GeocodingService,
  ) {}

  async createRequest(
    customerId: string,
    dto: CreateRequestDto,
  ): Promise<RequestEntity> {
    const user = await executeWithRetry(() =>
      this.usersService.findById(customerId),
    );
    if (!user) throw new NotFoundException('User not found');
    if ((user as any).role !== 'customer')
      throw new ForbiddenException('Only customers can create requests');

    let address = dto.address ? dto.address : {};
    let location = dto.location;
    if (
      !location &&
      address &&
      ((address as any).street ||
        (address as any).city ||
        (address as any).fullAddress)
    ) {
      const result = await this.geocoding.geocode(address as any);
      if (result) {
        address = {
          ...(address as any),
          latitude: result.latitude,
          longitude: result.longitude,
          fullAddress: result.fullAddress,
        };
        location = {
          latitude: result.latitude,
          longitude: result.longitude,
          address: result.fullAddress,
        };
      }
    }

    const doc = new this.requestModel({
      customerId: new Types.ObjectId(customerId),
      address,
      location: location
        ? {
            latitude: (location as any).latitude,
            longitude: (location as any).longitude,
            address: (location as any).address || null,
            city: (location as any).city || null,
            state: (location as any).state || null,
            zipCode: (location as any).zipCode || null,
          }
        : null,
      locationPoint: location
        ? {
            type: 'Point',
            coordinates: [
              Number((location as any).longitude),
              Number((location as any).latitude),
            ],
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
    this.logger.info('Request created', {
      requestId: (saved as any)._id.toString(),
      customerId,
    });
    this.events.emit('request.created', {
      id: (saved as any)._id.toString(),
      customerId,
    });
    return saved;
  }

  async applyForRequest(
    providerId: string,
    requestId: string,
    dto: ApplyForRequestDto,
  ): Promise<RequestEntity> {
    const user = await executeWithRetry(() =>
      this.usersService.findById(providerId),
    );
    if (!user) throw new NotFoundException('User not found');
    if ((user as any).role !== 'provider')
      throw new ForbiddenException('Only providers can apply for requests');

    const req = await executeWithRetry(() =>
      this.requestModel.findById(requestId).exec(),
    );
    if (!req) throw new NotFoundException('Request not found');
    if (
      req.status === RequestStatusEnum.ACCEPTED ||
      req.status === RequestStatusEnum.COMPLETED ||
      req.status === RequestStatusEnum.CLOSED
    ) {
      throw new BadRequestException(
        'Cannot apply to a request that is accepted or completed',
      );
    }

    const alreadyApplied = (req.applications || []).some(
      (a: any) => a.providerId.toString() === providerId,
    );
    if (alreadyApplied)
      throw new BadRequestException('Provider has already applied');

    const proposedEts = dto.proposedEts ? new Date(dto.proposedEts) : null;
    const price =
      typeof dto.proposedPrice === 'number' ? dto.proposedPrice : null;
    const priceMin =
      typeof dto.proposedPriceMin === 'number' ? dto.proposedPriceMin : null;
    const priceMax =
      typeof dto.proposedPriceMax === 'number' ? dto.proposedPriceMax : null;
    req.applications.push({
      providerId: new Types.ObjectId(providerId),
      message: dto.message ?? null,
      appliedAt: new Date(),
      proposedEts,
      proposedPrice: price,
      proposedPriceMin: priceMin,
      proposedPriceMax: priceMax,
    } as any);
    const previousStatus = req.status;
    if (req.status === RequestStatusEnum.OPEN) {
      req.status = RequestStatusEnum.PENDING;
    }
    const updated = await executeWithRetry(() => req.save());
    this.logger.info('Provider applied to request', { requestId, providerId });
    // Notify customer of a new application
    this.events.emit('request.application.created', {
      id: requestId,
      providerId,
    });
    if (
      previousStatus !== updated.status &&
      updated.status === RequestStatusEnum.PENDING
    ) {
      this.events.emit('request.pending', { id: requestId });
    }
    return updated;
  }

  async acceptProvider(
    customerId: string,
    requestId: string,
    dto: AcceptProviderDto,
  ): Promise<RequestEntity> {
    const req = await executeWithRetry(() =>
      this.requestModel.findById(requestId).exec(),
    );
    if (!req) throw new NotFoundException('Request not found');
    if ((req.customerId as any).toString() !== customerId)
      throw new ForbiddenException('Only the customer can accept a provider');
    if (
      req.status === RequestStatusEnum.ACCEPTED ||
      req.status === RequestStatusEnum.COMPLETED ||
      req.status === RequestStatusEnum.CLOSED
    ) {
      throw new BadRequestException('Request already accepted or completed');
    }

    const providerApplied = (req.applications || []).some(
      (a: any) => a.providerId.toString() === dto.providerId,
    );
    if (!providerApplied)
      throw new BadRequestException('Selected provider has not applied');

    const result = await runInTransaction(this.connection, async (session) => {
      const updated = await this.requestModel
        .findByIdAndUpdate(
          requestId,
          {
            $set: {
              acceptedProviderId: new Types.ObjectId(dto.providerId),
              status: RequestStatusEnum.ACCEPTED,
            },
          },
          { new: true, session },
        )
        .exec();
      if (!updated) throw new NotFoundException('Request not found');
      return updated;
    });

    this.logger.info('Provider accepted for request', {
      requestId,
      providerId: dto.providerId,
      customerId,
    });
    this.events.emit('request.accepted', {
      id: requestId,
      providerId: dto.providerId,
    });

    // Wait for order to be created by the listener (poll with timeout)
    let order: OrderDocument | null = null;
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      order = await this.orderModel.findOne({ requestId: result._id }).exec();
      if (order) break;
    }

    // Add orderId to response if order was created
    const response: any = result.toObject ? result.toObject() : result;
    if (order) {
      response.orderId = (order as any)._id.toString();
    }

    return response;
  }

  async completeRequest(
    actorUserId: string,
    requestId: string,
  ): Promise<RequestEntity> {
    const req = await executeWithRetry(() =>
      this.requestModel.findById(requestId).exec(),
    );
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== RequestStatusEnum.ACCEPTED)
      throw new BadRequestException('Only accepted requests can be completed');
    const isCustomer = (req.customerId as any).toString() === actorUserId;
    const isProvider = req.acceptedProviderId
      ? (req.acceptedProviderId as any).toString() === actorUserId
      : false;
    if (!isCustomer && !isProvider)
      throw new ForbiddenException(
        'Only the customer or accepted provider can complete the request',
      );

    const updated = await executeWithRetry(() =>
      this.requestModel
        .findByIdAndUpdate(
          requestId,
          { $set: { status: RequestStatusEnum.COMPLETED } },
          { new: true },
        )
        .exec(),
    );
    this.logger.info('Request completed', { requestId, actorUserId });
    this.events.emit('request.completed', { id: requestId });
    return updated as any;
  }

  async listNearby(lat: number, lon: number, maxDistance: number) {
    if (!isFinite(lat) || !isFinite(lon))
      throw new BadRequestException('Invalid coordinates');
    const results = await this.requestModel
      .find({
        status: RequestStatusEnum.OPEN,
        locationPoint: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lon, lat] },
            $maxDistance: maxDistance,
          },
        },
      })
      .limit(100)
      .lean();
    return results.map((r: any) => ({
      id: String(r._id),
      customerId: String(r.customerId),
      address: r.address,
      location: r.location,
      category: r.category,
      estimatedTimeOfService: r.estimatedTimeOfService,
      status: r.status,
    }));
  }

  async addRequestPhotos(
    customerId: string,
    requestId: string,
    photoUrls: string[],
  ): Promise<RequestEntity> {
    const req = await executeWithRetry(() =>
      this.requestModel.findById(requestId).exec(),
    );
    if (!req) throw new NotFoundException('Request not found');
    if ((req.customerId as any).toString() !== customerId)
      throw new ForbiddenException('Only the customer can add photos');
    if (
      req.status === RequestStatusEnum.COMPLETED ||
      req.status === RequestStatusEnum.CLOSED
    ) {
      throw new BadRequestException(
        'Cannot add photos to a completed or closed request',
      );
    }

    const updatedPhotos = Array.isArray(req.photos)
      ? req.photos.concat(photoUrls)
      : photoUrls;
    const updated = await executeWithRetry(() =>
      this.requestModel
        .findByIdAndUpdate(
          requestId,
          { $set: { photos: updatedPhotos } },
          { new: true },
        )
        .exec(),
    );
    this.logger.info('Request photos added', {
      requestId,
      count: photoUrls.length,
    });
    return updated as any;
  }

  async listForCustomer(
    customerId: string,
    filters: {
      status?: RequestStatusEnum;
      offset?: number;
      limit?: number;
    } = {},
  ) {
    const base = { customerId: new Types.ObjectId(customerId) };
    const query = filters.status ? { ...base, status: filters.status } : base;
    let find = this.requestModel.find(query).sort({ createdAt: -1 });
    if (typeof filters.offset === 'number') find = find.skip(filters.offset);
    if (typeof filters.limit === 'number') find = find.limit(filters.limit);
    const items = await find.lean().exec();
    const providerIds = Array.from(
      new Set(
        items.flatMap((r: any) =>
          (Array.isArray(r.applications) ? r.applications : []).map((a: any) =>
            String(a.providerId),
          ),
        ),
      ),
    );
    const users = providerIds.length
      ? await this.userModel
          .find({
            _id: { $in: providerIds.map((id) => new Types.ObjectId(id)) },
          })
          .lean()
      : [];
    const meta: Record<string, { name: string; avatar?: string }> = {};
    for (const u of users as any[]) {
      meta[String(u._id)] = {
        name: `${u.firstName} ${u.lastName}`.trim(),
        avatar: u.avatar || undefined,
      };
    }
    return items.map((r: any) => ({
      ...r,
      _id: r._id,
      applicationsMeta: meta,
    }));
  }

  async listForProviders(
    filters: {
      status?: RequestStatusEnum;
      offset?: number;
      limit?: number;
    } = {},
  ) {
    const defaultStatuses = [RequestStatusEnum.OPEN, RequestStatusEnum.PENDING];
    const query = filters.status
      ? { status: filters.status }
      : { status: { $in: defaultStatuses } };

    let find = this.requestModel.find(query).sort({ createdAt: -1 });
    if (typeof filters.offset === 'number') find = find.skip(filters.offset);
    if (typeof filters.limit === 'number') find = find.limit(filters.limit);
    const items = await find.lean().exec();
    const providerIds = Array.from(
      new Set(
        items.flatMap((r: any) =>
          (Array.isArray(r.applications) ? r.applications : []).map((a: any) =>
            String(a.providerId),
          ),
        ),
      ),
    );
    const users = providerIds.length
      ? await this.userModel
          .find({
            _id: { $in: providerIds.map((id) => new Types.ObjectId(id)) },
          })
          .lean()
      : [];
    const meta: Record<string, { name: string; avatar?: string }> = {};
    for (const u of users as any[]) {
      meta[String(u._id)] = {
        name: `${u.firstName} ${u.lastName}`.trim(),
        avatar: u.avatar || undefined,
      };
    }
    return items.map((r: any) => ({
      ...r,
      _id: r._id,
      applicationsMeta: meta,
    }));
  }

  async getOneForProvider(requestId: string) {
    const doc = await executeWithRetry(() =>
      this.requestModel.findById(requestId).lean().exec(),
    );
    if (!doc) throw new NotFoundException('Request not found');
    return doc;
  }

  async getProvidersForRequest(customerId: string, requestId: string) {
    const req = await executeWithRetry(() =>
      this.requestModel.findById(requestId).lean().exec(),
    );
    if (!req) throw new NotFoundException('Request not found');
    if (String(req.customerId) !== String(customerId))
      throw new ForbiddenException(
        'Only the customer can view providers for this request',
      );

    const apps = Array.isArray((req as any).applications)
      ? (req as any).applications
      : [];
    const providerIdsSet = new Set<string>(
      apps.map((a: any) => String(a.providerId)),
    );
    const providerIds: string[] = Array.from(providerIdsSet);
    if (!providerIds.length) {
      return {
        request: {
          id: String((req as any)._id),
          category: req.category,
          status: req.status,
        },
        providers: [],
      };
    }

    const providerObjectIds = providerIds.map(
      (id: string) => new Types.ObjectId(id),
    );
    const users = await this.userModel
      .find({ _id: { $in: providerObjectIds } })
      .lean();

    // Aggregate reviews per provider
    const ReviewModel = this.connection.model('Review');
    const reviewsAgg = await ReviewModel.aggregate([
      { $match: { providerId: { $in: providerObjectIds } } },
      {
        $group: {
          _id: '$providerId',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
    const reviewsMap: Record<string, { count: number; avgRating: number }> = {};
    for (const r of reviewsAgg) {
      reviewsMap[String(r._id)] = {
        count: Number(r.count || 0),
        avgRating: Number(r.avgRating || 0),
      };
    }

    // Optional specialties from provider applications
    const ProviderAppModel = this.connection.model('ProviderApplication');
    const provApps = await ProviderAppModel.find({
      userId: { $in: providerObjectIds },
      status: 'approved',
    }).lean();
    const specMap: Record<string, string[]> = {};
    for (const pa of provApps as any[]) {
      const key = String(pa.userId);
      const arr = specMap[key] || [];
      if (pa.category) arr.push(String(pa.category));
      specMap[key] = arr;
    }

    // Completed orders per provider
    const OrderModel = this.connection.model('Order');
    const completedAgg = await OrderModel.aggregate([
      {
        $match: { providerId: { $in: providerObjectIds }, status: 'completed' },
      },
      { $group: { _id: '$providerId', completed: { $sum: 1 } } },
    ]);
    const completedMap: Record<string, number> = {};
    for (const c of completedAgg) {
      completedMap[String(c._id)] = Number(c.completed || 0);
    }

    const providers = users.map((u: any) => {
      const id = String(u._id);
      const rev = reviewsMap[id] || { count: 0, avgRating: 0 };
      const specialties = specMap[id] || [];
      const app = apps.find((a: any) => String(a.providerId) === id);
      return {
        id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        title: u.businessTitle || 'Prestataire',
        avatar: u.avatar || null,
        bio: u.bio || null,
        address:
          u.address &&
          (u.address.fullAddress || u.address.city || u.address.country)
            ? {
                fullAddress: u.address.fullAddress || null,
                city: u.address.city || null,
                country: u.address.country || null,
              }
            : null,
        timezone: u.timezone || null,
        locale: u.locale || null,
        status: u.status || null,
        providerStatus: u.providerStatus || null,
        rating: Number(rev.avgRating.toFixed(1)),
        reviewCount: rev.count,
        completedCount: completedMap[id] || 0,
        pricingRange: u.pricingRange || null,
        availability: u.availability || null,
        specialties,
        proposedEts: app?.proposedEts || null,
        proposedPrice: app?.proposedPrice ?? null,
        proposedPriceRange:
          app?.proposedPriceMin != null && app?.proposedPriceMax != null
            ? { min: app.proposedPriceMin, max: app.proposedPriceMax }
            : null,
      };
    });

    return {
      request: {
        id: String((req as any)._id),
        category: req.category,
        status: req.status,
        estimatedTimeOfService: req.estimatedTimeOfService,
      },
      providers,
    };
  }
}
