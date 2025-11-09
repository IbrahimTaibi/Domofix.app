import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { AppLogger } from '../src/common/logging/logger.service';
import { MonitoringService } from '../src/common/monitoring/monitoring.service';
import { ValidationError } from '../src/common/errors/app-error';
import { ValidationError as CvError } from 'class-validator';

describe('Error Handling (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Provide a dummy Mongo URI to satisfy Mongoose bootstrap without real DB
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test';
    process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'test-db';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
            const constraints = e.constraints ? Object.values(e.constraints) : [];
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

  it('returns standardized validation error for invalid login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errorId');
    expect(res.body).toMatchObject({
      type: 'ValidationError',
      statusCode: 400,
      message: expect.any(String),
      path: '/auth/login',
    });
    expect(res.body.details?.fields?.password?.length).toBeGreaterThan(0);
  });

  it('returns standardized authentication error for protected route without token', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('errorId');
    expect(res.body).toMatchObject({
      type: 'AuthenticationError',
      statusCode: 401,
      message: expect.any(String),
      path: '/users/me',
    });
  });
});