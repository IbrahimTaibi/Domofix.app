import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { AppLogger } from '../src/common/logging/logger.service';
import { MonitoringService } from '../src/common/monitoring/monitoring.service';
import { ValidationError } from '../src/common/errors/app-error';
import { ValidationError as CvError } from 'class-validator';
import { getModelToken } from '@nestjs/mongoose';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RequestStatusEnum } from '../src/requests/schemas/request.schema';
import { UsersService } from '../src/users/users.service';
// Bypass DB transactions during tests
jest.mock('@/common/db/transaction.util', () => ({
  runInTransaction: async (_connection: any, fn: Function) => await fn({}),
}));

class InMemoryRequestModel {
  static store: any[] = [];
  _id: string;
  customerId: any;
  address: any;
  phone?: string;
  category?: string;
  estimatedTimeOfService?: Date;
  details?: string;
  status?: RequestStatusEnum;
  applications: any[] = [];
  acceptedProviderId?: any;
  constructor(data: any) {
    Object.assign(this, data);
    this._id = `${Date.now()}-${Math.random()}`;
  }
  async save() {
    InMemoryRequestModel.store.push(this);
    return this;
  }
  static findById(id: string) {
    return {
      exec: async () =>
        InMemoryRequestModel.store.find((d) => d._id === id) || null,
    };
  }
  static findByIdAndUpdate(id: string, update: any, opts: any) {
    return {
      exec: async () => {
        const doc = InMemoryRequestModel.store.find((d) => d._id === id);
        if (!doc) return null;
        const set = update.$set || {};
        Object.assign(doc, set);
        return opts?.new ? doc : null;
      },
    };
  }
}

class HeaderBasedJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const role = req.headers['x-user-role'] || 'customer';
    const userId = req.headers['x-user-id'] || C_ID;
    req.user = { userId, role };
    return true;
  }
}

describe('Requests Flow (e2e)', () => {
  let app: INestApplication;
  const C_ID = '507f1f77bcf86cd799439011';
  const P_ID = '507f191e810c19729de860ea';

  beforeAll(async () => {
    // Provide a dummy Mongo URI to satisfy Mongoose bootstrap without real DB
    process.env.MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test';
    process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'test-db';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken('Request'))
      .useValue(InMemoryRequestModel as any)
      // Stub UsersService to avoid DB lookups and ObjectId casting
      .overrideProvider(UsersService)
      .useValue({
        findById: async (id: string) => {
          if (id === C_ID) return { role: 'customer', _id: id } as any;
          if (id === P_ID) return { role: 'provider', _id: id } as any;
          return null;
        },
      })
      .overrideGuard(JwtAuthGuard)
      .useClass(HeaderBasedJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    const logger = app.get(AppLogger);
    const monitoring = app.get(MonitoringService);
    await monitoring.init();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors: CvError[]) => {
          const fields: Record<string, string[]> = {};
          for (const e of errors) {
            const constraints = e.constraints
              ? Object.values(e.constraints)
              : [];
            if (e.property) fields[e.property] = constraints as string[];
          }
          return new ValidationError('Validation failed', { fields });
        },
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter(logger, monitoring));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid phone at creation with standardized error', async () => {
    const res = await request(app.getHttpServer())
      .post('/requests')
      .set('x-user-role', 'customer')
      .set('x-user-id', C_ID)
      .send({
        phone: '123',
        category: 'plumber',
        estimatedTimeOfService: new Date(Date.now() + 60000).toISOString(),
        location: { latitude: 48.8566, longitude: 2.3522 },
      });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      type: 'ValidationError',
      statusCode: 400,
      path: '/requests',
    });
    expect(res.body.details?.fields?.phone?.length).toBeGreaterThan(0);
  });

  it('completes happy path: create -> apply -> accept -> complete', async () => {
    // Create by customer
    const createRes = await request(app.getHttpServer())
      .post('/requests')
      .set('x-user-role', 'customer')
      .set('x-user-id', C_ID)
      .send({
        phone: '+12345678901',
        category: 'plumber',
        estimatedTimeOfService: new Date(Date.now() + 60000).toISOString(),
        location: { latitude: 40.7128, longitude: -74.0060, address: 'NYC' },
      });
    expect(createRes.status).toBe(201);
    const id = createRes.body._id || createRes.body.id;
    expect(id).toBeDefined();

    // Apply by provider
    const applyRes = await request(app.getHttpServer())
      .post(`/requests/${id}/apply`)
      .set('x-user-role', 'provider')
      .set('x-user-id', P_ID)
      .send({ message: 'Ready' });
    expect(applyRes.status).toBe(201);
    expect(applyRes.body.status).toBe(RequestStatusEnum.PENDING);

    // Accept by customer
    const acceptRes = await request(app.getHttpServer())
      .post(`/requests/${id}/accept`)
      .set('x-user-role', 'customer')
      .set('x-user-id', C_ID)
      .send({ providerId: P_ID });
    expect(acceptRes.status).toBe(201);
    expect(acceptRes.body.status).toBe(RequestStatusEnum.ACCEPTED);

    // Complete by provider
    const completeRes = await request(app.getHttpServer())
      .patch(`/requests/${id}/complete`)
      .set('x-user-role', 'provider')
      .set('x-user-id', P_ID)
      .send({});
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe(RequestStatusEnum.COMPLETED);
  });
});
