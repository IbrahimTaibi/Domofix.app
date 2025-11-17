import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  InternalError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '@/common/errors/app-error';
import { AppLogger } from '@/common/logging/logger.service';
import { MonitoringService } from '@/common/monitoring/monitoring.service';

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLogger,
    private readonly monitoring: MonitoringService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorId = randomUUID();
    const timestamp = new Date().toISOString();
    const path = request.originalUrl || request.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let type: string = 'InternalError';
    let message = 'Internal server error';
    let details: any = undefined;

    // Map known exception types
    if (exception instanceof AppError) {
      status = exception.getStatus();
      type = exception.type;
      message = exception.message;
      details = (exception as any).details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = (res && res.message) || exception.message || 'Error';
      type = this.mapHttpExceptionToType(status);
      details = res && res.error ? res.error : undefined;
    } else if (this.isMongooseError(exception)) {
      const mapped = this.mapMongoError(exception as any);
      status = mapped.getStatus();
      type = mapped.type;
      message = mapped.message;
      details = mapped.details;
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    const body: any = {
      errorId,
      type,
      statusCode: status,
      message,
      timestamp,
      path,
    };
    if (!isProd()) {
      body.details = details ?? this.extractErrorDetails(exception);
    }

    // Log with context
    this.logger.error(
      message,
      {
        errorId,
        type,
        statusCode: status,
        method: request.method,
        path,
        ip: (request.headers['x-forwarded-for'] as string) || request.ip,
        userAgent: request.headers['user-agent'],
        body: request.body,
        query: request.query,
        params: request.params,
      },
      exception instanceof Error ? exception.stack : undefined,
    );

    // Send to monitoring
    this.monitoring.captureException(exception, {
      errorId,
      type,
      statusCode: status,
      path,
    });

    // Special header for rate limit
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      response.setHeader('Retry-After', '60');
    }

    response.status(status).json(body);
  }

  private mapHttpExceptionToType(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'ValidationError';
      case HttpStatus.UNAUTHORIZED:
        return 'AuthenticationError';
      case HttpStatus.FORBIDDEN:
        return 'AuthorizationError';
      case HttpStatus.NOT_FOUND:
        return 'NotFoundError';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RateLimitError';
      default:
        return 'InternalError';
    }
  }

  private isMongooseError(err: unknown): boolean {
    const e: any = err;
    return (
      e &&
      (e.name === 'MongoServerError' ||
        e.name === 'MongooseError' ||
        e.name === 'CastError' ||
        e.name === 'MongoNetworkError')
    );
  }

  private mapMongoError(err: any): DatabaseError {
    if (err.code === 11000) {
      return new DatabaseError('Duplicate key error', HttpStatus.CONFLICT, {
        code: 11000,
        meta: { keyPattern: err.keyPattern },
      });
    }
    if (err.name === 'CastError') {
      return new DatabaseError('Invalid identifier', HttpStatus.BAD_REQUEST, {
        code: 'CastError',
        cause: err.message,
      });
    }
    if (err.name === 'MongoNetworkError') {
      return new DatabaseError(
        'Database network error',
        HttpStatus.SERVICE_UNAVAILABLE,
        { code: 'MongoNetworkError' },
      );
    }
    return new DatabaseError(
      err.message || 'Database error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { cause: err },
    );
  }

  private extractErrorDetails(exception: unknown): any {
    const e: any = exception;
    if (!e) return undefined;
    return {
      name: e.name,
      message: e.message,
      stack: e.stack,
    };
  }
}
