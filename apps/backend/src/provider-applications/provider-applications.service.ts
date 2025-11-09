import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import {
  ProviderApplication,
  ProviderApplicationDocument,
} from './schemas/provider-application.schema';
import { CreateProviderApplicationDto } from './dto/create-provider-application.dto';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { executeWithRetry } from '@/common/db/retry.util';
import { runInTransaction } from '@/common/db/transaction.util';
import { InjectConnection } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProviderApplicationsService {
  constructor(
    @InjectModel(ProviderApplication.name)
    private appModel: Model<ProviderApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
    private usersService: UsersService,
    private readonly events: EventEmitter2,
  ) {}

  async create(
    userId: string,
    dto: CreateProviderApplicationDto,
    documentUrl: string,
  ): Promise<ProviderApplication> {
    const user = await executeWithRetry(() =>
      this.usersService.findById(userId),
    );
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'provider') {
      throw new ForbiddenException('Already a provider');
    }

    // Prevent duplicate pending applications
    const existingPending = await executeWithRetry(() =>
      this.appModel
        .findOne({ userId: new Types.ObjectId(userId), status: 'pending' })
        .exec(),
    );
    if (existingPending) {
      throw new BadRequestException('You already have a pending application');
    }

    // Create new application and mark user providerStatus as pending in a transaction
    const app = await runInTransaction(this.connection, async (session) => {
      const created = new this.appModel({
        userId: new Types.ObjectId(userId),
        businessName: dto.businessName,
        phone: dto.phone,
        category: dto.category,
        documentUrl,
        notes: dto.notes,
        status: 'pending',
      });
      const saved = await created.save({ session });
      await this.userModel
        .findByIdAndUpdate(
          userId,
          { $set: { providerStatus: 'pending' } },
          { session },
        )
        .exec();
      return saved;
    });
    this.events.emit('providerApplication.created', { id: (app as any)?._id?.toString?.() || '', userId });
    return app;
  }

  async findMyLatest(userId: string): Promise<ProviderApplication | null> {
    return this.appModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async list(status?: string): Promise<ProviderApplication[]> {
    const filter: any = {};
    if (status) filter.status = status;
    return this.appModel.find(filter).sort({ createdAt: -1 }).limit(100).exec();
  }

  async updateStatus(
    appId: string,
    status: 'pending' | 'approved' | 'rejected' | 'needs_info',
  ): Promise<ProviderApplication> {
    const app = await executeWithRetry(() =>
      this.appModel
        .findByIdAndUpdate(appId, { $set: { status } }, { new: true })
        .exec(),
    );
    if (!app) throw new NotFoundException('Application not found');

    const userId = app.userId.toString();
    // Update user's providerStatus and role on approval
    await executeWithRetry(() => this.setUserProviderStatus(userId, status));
    if (status === 'approved') {
      await executeWithRetry(() =>
        this.usersService.updateUser(userId, { role: 'provider' } as any),
      );
    }
    return app;
  }

  private async setUserProviderStatus(
    userId: string,
    status: 'none' | 'pending' | 'approved' | 'rejected' | 'needs_info',
  ) {
    await this.userModel
      .findByIdAndUpdate(userId, { $set: { providerStatus: status } })
      .exec();
  }
}
