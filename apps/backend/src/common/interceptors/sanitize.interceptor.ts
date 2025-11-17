import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

function sanitizeObject(obj: any, depth = 0): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (depth > 5) return obj; // avoid deep recursion

  if (Array.isArray(obj))
    return obj.map((item) => sanitizeObject(item, depth + 1));

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip proto pollution keys and Mongo operators
    if (key === '__proto__' || key === 'constructor' || key.startsWith('$'))
      continue;
    clean[key] = sanitizeObject(value, depth + 1);
    if (typeof clean[key] === 'string') {
      clean[key] = clean[key].trim();
    }
  }
  return clean;
}

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): ReturnType<CallHandler['handle']> {
    const req = context.switchToHttp().getRequest<any>();
    if (req) {
      // Sanitize body safely (body is writable)
      req.body = sanitizeObject(req.body);

      // For query/params, avoid reassigning the property itself since some frameworks
      // expose them via getters (non-writable). Mutate object contents in place.
      const q = sanitizeObject(req.query);
      if (
        q &&
        typeof q === 'object' &&
        req.query &&
        typeof req.query === 'object'
      ) {
        try {
          // Remove keys that were stripped by sanitizer
          Object.keys(req.query).forEach((k) => {
            if (!(k in q)) delete req.query[k];
          });
          Object.assign(req.query, q);
        } catch {
          // If mutation fails, attach sanitized copy without touching the getter
          req.sanitizedQuery = q;
        }
      }

      const p = sanitizeObject(req.params);
      if (
        p &&
        typeof p === 'object' &&
        req.params &&
        typeof req.params === 'object'
      ) {
        try {
          Object.keys(req.params).forEach((k) => {
            if (!(k in p)) delete req.params[k];
          });
          Object.assign(req.params, p);
        } catch {
          req.sanitizedParams = p;
        }
      }
    }
    return next.handle();
  }
}
