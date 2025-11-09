import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { AppLogger } from '@/common/logging/logger.service';
import { MonitoringService } from '@/common/monitoring/monitoring.service';
import { SanitizeInterceptor } from '@/common/interceptors/sanitize.interceptor';
import { ValidationError } from '@/common/errors/app-error';
import { ValidationError as CvError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOriginsEnv = process.env.CORS_ORIGINS;
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:3002'];
  const allowedOrigins =
    corsOriginsEnv
      ?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? defaultOrigins;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve uploaded documents statically
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Monitoring init
  const monitoring = app.get(MonitoringService);
  await monitoring.init();

  // Global sanitize
  app.useGlobalInterceptors(new SanitizeInterceptor());

  // Validation with consistent error
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

  // Global error filter
  const logger = app.get(AppLogger);
  app.useGlobalFilters(new GlobalExceptionFilter(logger, monitoring));

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
}
bootstrap();
