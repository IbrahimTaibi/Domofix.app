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
  const streets = [
    'Rue de la Liberté',
    'Avenue Habib Bourguiba',
    'Rue Ibn Khaldoun',
    'Rue de Carthage',
    'Rue de Monastir',
    'Rue de la Kasbah',
  ];
  function rnd(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  function addr(i: number) {
    const s = streets[i % streets.length];
    const city = i % 5 === 0 ? 'Ariana' : 'Tunis';
    const lat = rnd(36.78, 36.88);
    const lon = rnd(10.15, 10.22);
    return {
      street: s,
      city,
      country: 'TN',
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lon.toFixed(5)),
      fullAddress: `${s}, ${city}, TN`,
    };
  }
  const baseProviders = [
    {
      email: 'provider1@example.com',
      id: new Types.ObjectId(),
      firstName: 'Ali',
      lastName: 'K',
      phone: '+21612345678',
    },
    {
      email: 'provider2@example.com',
      id: new Types.ObjectId(),
      firstName: 'Youssef',
      lastName: 'B',
      phone: '+21622334455',
    },
  ];
  for (let i = 0; i < 18; i++) {
    baseProviders.push({
      email: `provider${i + 3}@example.com`,
      id: new Types.ObjectId(),
      firstName: 'Provider',
      lastName: String(i + 3),
      phone: `+2165${i}123456`,
    });
  }
  await UserModel.create(
    baseProviders.map((p, i) => {
      providers.push(p.id);
      return {
        _id: p.id,
        email: p.email,
        password: providerPwd,
        role: 'provider',
        phoneNumber: p.phone,
        address: addr(i),
        providerStatus: i < 10 ? 'approved' : 'pending',
        firstName: p.firstName,
        lastName: p.lastName,
      } as any;
    }),
  );
  const baseCustomers = [
    {
      email: 'customer1@example.com',
      id: new Types.ObjectId(),
      firstName: 'Sara',
      lastName: 'M',
      phone: '+21699887766',
    },
    {
      email: 'customer2@example.com',
      id: new Types.ObjectId(),
      firstName: 'Noura',
      lastName: 'H',
      phone: '+21688990077',
    },
  ];
  for (let i = 0; i < 38; i++) {
    baseCustomers.push({
      email: `customer${i + 3}@example.com`,
      id: new Types.ObjectId(),
      firstName: 'Customer',
      lastName: String(i + 3),
      phone: `+2169${i}88776`,
    });
  }
  await UserModel.create(
    baseCustomers.map((c, i) => {
      customers.push(c.id);
      return {
        _id: c.id,
        email: c.email,
        password: customerPwd,
        role: 'customer',
        phoneNumber: c.phone,
        address: addr(i + 20),
        firstName: c.firstName,
        lastName: c.lastName,
      } as any;
    }),
  );

  // Seed requests
  const now = Date.now();
  const categories = [
    'plumber',
    'electrician',
    'cleaner',
    'gardener',
    'carpenter',
  ];
  const reqDocs: any[] = [];
  for (let i = 0; i < 300; i++) {
    const cust = customers[i % customers.length];
    const a = addr(i + 50);
    const lat = a.latitude;
    const lon = a.longitude;
    const statusPick = Math.random();
    let status = RequestStatusEnum.OPEN;
    let acceptedProviderId: Types.ObjectId | undefined;
    if (statusPick > 0.5 && statusPick <= 0.8) {
      status = RequestStatusEnum.ACCEPTED;
      acceptedProviderId = providers[i % providers.length];
    } else if (statusPick > 0.8) {
      status = RequestStatusEnum.COMPLETED;
      acceptedProviderId = providers[(i + 3) % providers.length];
    }
    reqDocs.push({
      _id: new Types.ObjectId(),
      customerId: cust,
      phone: `+216${Math.floor(10000000 + Math.random() * 89999999)}`,
      category: categories[i % categories.length],
      estimatedTimeOfService: new Date(now + ((i % 4) + 1) * 60 * 60 * 1000),
      status,
      acceptedProviderId,
      address: a,
      location: {
        latitude: lat,
        longitude: lon,
        address: a.fullAddress,
      } as any,
      locationPoint: { type: 'Point', coordinates: [lon, lat] },
    });
  }
  const requests = await RequestModel.create(reqDocs);

  // Seed orders from accepted requests
  const orderDocs: any[] = [];
  for (const r of requests) {
    if (r.status === RequestStatusEnum.ACCEPTED && r.acceptedProviderId) {
      const assigned = Math.random() > 0.5;
      orderDocs.push({
        _id: new Types.ObjectId(),
        requestId: (r as any)._id,
        customerId: r.customerId,
        providerId: r.acceptedProviderId,
        status: assigned ? 'assigned' : 'in_progress',
        acceptedAt: new Date(
          now - (Math.floor(Math.random() * 3) + 1) * 60 * 60 * 1000,
        ),
        startedAt: assigned ? undefined : new Date(now - 60 * 60 * 1000),
      });
    } else if (
      r.status === RequestStatusEnum.COMPLETED &&
      r.acceptedProviderId
    ) {
      orderDocs.push({
        _id: new Types.ObjectId(),
        requestId: (r as any)._id,
        customerId: r.customerId,
        providerId: r.acceptedProviderId,
        status: 'completed',
        acceptedAt: new Date(now - 24 * 60 * 60 * 1000),
        startedAt: new Date(now - 23 * 60 * 60 * 1000),
        completedAt: new Date(now - 22 * 60 * 60 * 1000),
      });
    }
  }
  const orders = await OrderModel.create(orderDocs);

  // Seed notifications
  const notifDocs: any[] = [];
  for (const o of orders.slice(0, 100)) {
    notifDocs.push({
      userId: String(o.providerId),
      type: 'system.message',
      severity: 'info',
      title: 'New assignment',
      message: 'You have a new order',
      data: { orderId: String((o as any)._id) },
    });
    notifDocs.push({
      userId: String(o.customerId),
      type: 'system.message',
      severity: 'success',
      title: 'Request accepted',
      message: 'Provider accepted your request',
      data: { requestId: String(o.requestId) },
    });
  }
  await NotificationModel.create(notifDocs as any);

  // Seed reviews and comments (link to orders)
  const completedOrders = orders.filter((o: any) => o.status === 'completed');
  for (const o of completedOrders.slice(0, 60)) {
    const rev = await ReviewModel.create({
      bookingId: (o as any)._id,
      customerId: o.customerId,
      providerId: o.providerId,
      serviceId: new Types.ObjectId(),
      rating: Math.floor(rnd(3, 5)),
      comment: 'Service review',
      images: [],
    } as any);
    await CommentModel.create([
      { reviewId: rev._id, authorId: o.customerId, content: 'Thanks!' } as any,
      {
        reviewId: rev._id,
        authorId: o.providerId,
        content: 'Pleasure to help.',
      } as any,
    ]);
  }

  // Seed messaging threads and messages
  for (const o of orders.slice(0, 120)) {
    const thread = await ThreadModel.create({
      orderId: (o as any)._id,
      participants: [
        { userId: o.customerId, role: 'customer' },
        { userId: o.providerId, role: 'provider' },
      ],
      status: 'open',
      lastMessageAt: null,
      unreadCounts: {},
    } as any);
    await MessageModel.create([
      {
        threadId: thread._id,
        senderId: o.customerId,
        kind: 'text',
        text: 'Hello, can you confirm arrival time?',
        status: 'sent',
      } as any,
      {
        threadId: thread._id,
        senderId: o.providerId,
        kind: 'text',
        text: 'Sure, I will be there at 16:00.',
        status: 'sent',
      } as any,
    ]);
  }

  // Seed avatars for customers
  const sampleAvatars = [
    '/uploads/request-photos/1762730896234-394059162.jpg',
    '/uploads/request-photos/1762730896235-420690649.jpg',
    '/uploads/request-photos/1762730896236-248942398.jpg',
    '/uploads/request-photos/1762726466012-245628361.jpg',
    '/uploads/request-photos/1762726466013-303596230.jpg',
  ]
  try {
    await UserModel.updateMany({ role: 'customer' }, [
      {
        $set: {
          avatar: {
            $concat: [
              { $literal: 'http://localhost:3001' },
              {
                $arrayElemAt: [sampleAvatars, { $mod: [{ $toInt: { $rand: {} } }, sampleAvatars.length] }],
              },
            ],
          },
        },
      },
    ])
  } catch (e) {}

  // Extra discussions for provider1@example.com (Ali K) with multiple customers
  const provider1Id = baseProviders[0].id
  const extraOrders: any[] = []
  for (let i = 0; i < Math.min(20, customers.length); i++) {
    const custId = customers[i]
    const ordId = new Types.ObjectId()
    extraOrders.push({
      _id: ordId,
      requestId: new Types.ObjectId(),
      customerId: custId,
      providerId: provider1Id,
      status: 'in_progress',
      acceptedAt: new Date(now - 2 * 60 * 60 * 1000),
      startedAt: new Date(now - 60 * 60 * 1000),
    })
  }
  const seededExtraOrders = await OrderModel.create(extraOrders)
  for (const o of seededExtraOrders) {
    const thread = await ThreadModel.create({
      orderId: (o as any)._id,
      participants: [
        { userId: o.customerId, role: 'customer' },
        { userId: o.providerId, role: 'provider' },
      ],
      status: 'open',
      lastMessageAt: null,
      unreadCounts: {},
    } as any)
    await MessageModel.create([
      {
        threadId: thread._id,
        senderId: o.customerId,
        kind: 'text',
        text: 'Bonjour Ali, pouvez-vous passer aujourd\u2019hui ?'
      } as any,
      {
        threadId: thread._id,
        senderId: o.providerId,
        kind: 'text',
        text: 'Oui, je suis disponible en fin d\u2019après-midi.'
      } as any,
      {
        threadId: thread._id,
        senderId: o.customerId,
        kind: 'text',
        text: 'Parfait, merci !'
      } as any,
    ])
  }

  console.log('Seeding completed.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
