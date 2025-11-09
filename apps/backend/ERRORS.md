# Backend Error Handling

This backend implements a comprehensive, consistent error handling system across all modules.

## Response Format

All API errors are formatted as:

```
{
  "errorId": "uuid",
  "type": "ValidationError | AuthenticationError | AuthorizationError | NotFoundError | DatabaseError | RateLimitError | InternalError",
  "statusCode": 400,
  "message": "Human-readable message",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "path": "/api/resource",
  "details": { ... } // development only
}
```

## Error Types

- ValidationError (400)
- AuthenticationError (401)
- AuthorizationError (403)
- NotFoundError (404)
- RateLimitError (429)
- DatabaseError (409/400/503/500)
- InternalError (500)

## Logging & Monitoring

- Logs include timestamp, request method, URL, IP, userAgent, and a redacted body.
- Sensitive fields are always masked (`password`, `token`, `access_token`, `refresh_token`, `authorization`, `secret`, `apiKey`).
- Optional monitoring integration via Sentry using `SENTRY_DSN`.

## Validation & Sanitization

- Global `ValidationPipe` ensures whitelisting, forbids unknown fields, and transforms types.
- Validation errors include `details.fields` with field-level messages.
- Global `SanitizeInterceptor` trims strings and removes dangerous keys (e.g., `$`, `__proto__`).

## Database Resilience

- Transient errors are retried with exponential backoff (`executeWithRetry`).
- Multi-step write operations use MongoDB transactions (`runInTransaction`) to ensure atomicity and rollbacks.
- Mongoose connection is configured with `retryWrites`, reasonable timeouts, and dev-only `autoIndex`.

## Security

- Production responses exclude technical details to prevent information leakage.
- Rate limiting is enforced globally; 429 responses include `Retry-After`.
- Input sanitization mitigates prototype pollution and Mongo operator injection.

## Testing

- E2E tests validate standardized error responses for common scenarios.
- Unit tests can be added for custom error classes and filters.

## Troubleshooting

- Verify `MONGODB_URI` and connectivity; transient connection issues will auto-retry.
- Ensure `JWT_*` secrets are configured; authentication failures return 401 with safe messaging.
- To enable monitoring, set `SENTRY_DSN` and optionally `SENTRY_ENV` and `SENTRY_TRACES_SAMPLE_RATE`.