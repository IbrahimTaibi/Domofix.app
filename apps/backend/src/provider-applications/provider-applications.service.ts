import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProviderApplication, ProviderApplicationDocument } from './schemas/provider-application.schema';
import { CreateProviderApplicationDto } from './dto/create-provider-application.dto';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ProviderApplicationsService {
  constructor(
    @InjectModel(ProviderApplication.name) private appModel: Model<ProviderApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateProviderApplicationDto, documentUrl: string): Promise<ProviderApplication> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'provider') {
      throw new ForbiddenException('Already a provider');
    }

    // Prevent duplicate pending applications
    const existingPending = await this.appModel.findOne({ userId: new Types.ObjectId(userId), status: 'pending' }).exec();
    if (existingPending) {
      throw new BadRequestException('You already have a pending application');
    }

    // Create new application and mark user providerStatus as pending
    const created = new this.appModel({
      userId: new Types.ObjectId(userId),
      businessName: dto.businessName,
      phone: dto.phone,
      category: dto.category,
      documentUrl,
      notes: dto.notes,
      status: 'pending',
    });
    const app = await created.save();
    await this.setUserProviderStatus(userId, 'pending');
    return app;
  }

  async findMyLatest(userId: string): Promise<ProviderApplication | null> {
    return this.appModel.findOne({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async list(status?: string): Promise<ProviderApplication[]> {
    const filter: any = {};
    if (status) filter.status = status;
    return this.appModel.find(filter).sort({ createdAt: -1 }).limit(100).exec();
  }

  async updateStatus(appId: string, status: 'pending' | 'approved' | 'rejected' | 'needs_info'): Promise<ProviderApplication> {
    const app = await this.appModel.findByIdAndUpdate(appId, { $set: { status } }, { new: true }).exec();
    if (!app) throw new NotFoundException('Application not found');

    const userId = app.userId.toString();
    // Update user's providerStatus and role on approval
    await this.setUserProviderStatus(userId, status);
    if (status === 'approved') {
      await this.usersService.updateUser(userId, { role: 'provider' } as any);
    }
    return app;
  }

  private async setUserProviderStatus(userId: string, status: 'none' | 'pending' | 'approved' | 'rejected' | 'needs_info') {
    await this.userModel.findByIdAndUpdate(userId, { $set: { providerStatus: status } }).exec();
  }
}