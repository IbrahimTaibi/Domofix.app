import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtQueryAuthGuard extends AuthGuard('jwt') {
  getRequest(context: any) {
    const req = context.switchToHttp().getRequest();
    // If no Authorization header, allow token via query param for SSE/EventSource
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth) {
      const token =
        (req.query?.token as string | undefined) ||
        (req.headers['x-access-token'] as string | undefined);
      if (token) {
        req.headers['authorization'] = token.startsWith('Bearer ')
          ? token
          : `Bearer ${token}`;
      }
    }
    return req;
  }
}
