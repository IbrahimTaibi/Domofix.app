/* eslint-disable */
import mongoose, { Types } from 'mongoose';
import { config } from 'dotenv';
config();

// Schemas
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  Request as RequestEntity,
  RequestSchema,
  RequestStatusEnum,
} from '../requests/schemas/request.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import {
  Notification,
  NotificationSchema,
} from '../notifications/schemas/notification.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { Comment, CommentSchema } from '../reviews/schemas/comment.schema';
import { Thread, ThreadSchema } from '../messaging/schemas/thread.schema';
import { Message, MessageSchema } from '../messaging/schemas/message.schema';
import { hashPassword } from '@darigo/shared-utils';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/darigo';
  const force = process.argv.includes('--force');
  if (process.env.NODE_ENV === 'production' && !force) {
    console.error('Refusing to seed in production without --force');
    process.exit(1);
  }

  const parsed = new URL(uri);
  const dbName =
    process.env.MONGODB_DB || parsed.pathname.replace(/^\//, '') || 'domofix';
  await mongoose.connect(uri, { dbName });
  const UserModel = mongoose.model<User>('User', UserSchema);
  const RequestModel = mongoose.model<RequestEntity>('Request', RequestSchema);
  const OrderModel = mongoose.model<Order>('Order', OrderSchema);
  const NotificationModel = mongoose.model<Notification>(
    'Notification',
    NotificationSchema,
  );
  const ReviewModel = mongoose.model<Review>('Review', ReviewSchema);
  const CommentModel = mongoose.model<Comment>('Comment', CommentSchema);
  const ThreadModel = mongoose.model<Thread>('Thread', ThreadSchema);
  const MessageModel = mongoose.model<Message>('Message', MessageSchema);

  // Empty collections
  await Promise.all([
    MessageModel.deleteMany({}),
    ThreadModel.deleteMany({}),
    CommentModel.deleteMany({}),
    ReviewModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    OrderModel.deleteMany({}),
    RequestModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);

  const providerPwd = await hashPassword('Provider@123');
  const customerPwd = await hashPassword('Customer@123');
  const providers: Types.ObjectId[] = [];
  const customers: Types.ObjectId[] = [];
  const streets = ['Rue de la Liberté','Avenue Habib Bourguiba','Rue Ibn Khaldoun','Rue de Carthage','Rue de Monastir','Rue de la Kasbah'];
  function rnd(min: number, max: number) { return Math.random() * (max - min) + min }
  function addr(i: number) {
    const s = streets[i % streets.length]
    const city = i % 2 === 0 ? 'Tunis' : 'Ariana'
    const lat = rnd(36.78, 36.88)
    const lon = rnd(10.15, 10.22)
    return { street: s, city, country: 'TN', latitude: Number(lat.toFixed(5)), longitude: Number(lon.toFixed(5)), fullAddress: `${s}, ${city}, TN` }
  }

  const baseProviders = [
    { email: 'provider1@example.com', id: new Types.ObjectId(), firstName: 'Ali', lastName: 'K', phone: '+21612345678', avatar: 'https://i.pravatar.cc/150?img=11' },
    { email: 'provider2@example.com', id: new Types.ObjectId(), firstName: 'Youssef', lastName: 'B', phone: '+21622334455', avatar: 'https://i.pravatar.cc/150?img=12' },
    { email: 'provider3@example.com', id: new Types.ObjectId(), firstName: 'Rania', lastName: 'T', phone: '+21633445566', avatar: 'https://i.pravatar.cc/150?img=13' },
  ]
  await UserModel.create(baseProviders.map((p, i) => {
    providers.push(p.id);
    return {
      _id: p.id,
      email: p.email,
      password: providerPwd,
      role: 'provider',
      phoneNumber: p.phone,
      address: addr(i),
      providerStatus: 'approved',
      firstName: p.firstName,
      lastName: p.lastName,
      avatar: p.avatar,
    } as any
  }))

  const baseCustomers = [
    { email: 'customer1@example.com', id: new Types.ObjectId(), firstName: 'Sara', lastName: 'M', phone: '+21699887766' },
    { email: 'customer2@example.com', id: new Types.ObjectId(), firstName: 'Noura', lastName: 'H', phone: '+21688990077' },
    { email: 'customer3@example.com', id: new Types.ObjectId(), firstName: 'Karim', lastName: 'S', phone: '+21677889900' },
    { email: 'customer4@example.com', id: new Types.ObjectId(), firstName: 'Aya', lastName: 'B', phone: '+21666778899' },
    { email: 'customer5@example.com', id: new Types.ObjectId(), firstName: 'Amine', lastName: 'D', phone: '+21655667788' },
  ]
  await UserModel.create(baseCustomers.map((c, i) => { customers.push(c.id); return { _id: c.id, email: c.email, password: customerPwd, role: 'customer', phoneNumber: c.phone, address: addr(i + 10), firstName: c.firstName, lastName: c.lastName } as any }))

  const now = Date.now()
  const categories = ['plumber','electrician','cleaner']
  const reqDocs: any[] = []
  for (let ci = 0; ci < customers.length; ci++) {
    for (let rj = 0; rj < 3; rj++) {
      const a = addr(ci * 3 + rj)
      const lat = a.latitude
      const lon = a.longitude
      const applications = baseProviders.map((p, k) => ({ providerId: p.id, message: 'Je suis disponible', appliedAt: new Date(now - (rj + 1) * 600000), proposedEts: new Date(now + (rj + 1) * 90 * 60000), proposedPriceMin: 50 + k * 10, proposedPriceMax: 120 + k * 15 }))
      reqDocs.push({
        _id: new Types.ObjectId(),
        customerId: customers[ci],
        phone: `+216${Math.floor(10000000 + Math.random() * 89999999)}`,
        category: categories[rj % categories.length],
        estimatedTimeOfService: new Date(now + (rj + 1) * 2 * 60 * 60 * 1000),
        status: RequestStatusEnum.PENDING,
        acceptedProviderId: null,
        address: a,
        location: { latitude: lat, longitude: lon, address: a.fullAddress } as any,
        locationPoint: { type: 'Point', coordinates: [lon, lat] },
        applications,
      })
    }
  }
  await RequestModel.create(reqDocs)

  console.log('Seeding completed. Providers: 3, Customers: 5, Requests: 15');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
