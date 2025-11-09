import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorType =
  | 'ValidationError'
  | 'AuthenticationError'
  | 'AuthorizationError'
  | 'NotFoundError'
  | 'DatabaseError'
  | 'RateLimitError'
  | 'InternalError';

export interface ErrorDetails {
  code?: string | number;
  cause?: unknown;
  fields?: Record<string, string[]>;
  meta?: Record<string, unknown>;
}

export class AppError extends HttpException {
  readonly type: ErrorType;
  readonly errorId?: string;
  readonly details?: ErrorDetails;
  readonly isOperational = true;

  constructor(type: ErrorType, message: string, status: number, details?: ErrorDetails) {
    super(message, status);
    this.type = type;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request parameters', details?: ErrorDetails) {
    super('ValidationError', message, HttpStatus.BAD_REQUEST, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', details?: ErrorDetails) {
    super('AuthenticationError', message, HttpStatus.UNAUTHORIZED, details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Forbidden', details?: ErrorDetails) {
    super('AuthorizationError', message, HttpStatus.FORBIDDEN, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: ErrorDetails) {
    super('NotFoundError', message, HttpStatus.NOT_FOUND, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details?: ErrorDetails) {
    super('RateLimitError', message, HttpStatus.TOO_MANY_REQUESTS, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error', status: number = HttpStatus.INTERNAL_SERVER_ERROR, details?: ErrorDetails) {
    super('DatabaseError', message, status, details);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', details?: ErrorDetails) {
    super('InternalError', message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}