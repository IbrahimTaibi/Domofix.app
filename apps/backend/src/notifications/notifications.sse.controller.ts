import { Controller, Sse, UseGuards, Req } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { Observable } from 'rxjs'
import { JwtQueryAuthGuard } from '../auth/guards/jwt-query.guard'
import { NotificationsService } from './notifications.service'

type SseEvent = { event?: string; data: any }

@Controller('notifications')
export class NotificationsSseController {
  constructor(private readonly service: NotificationsService) {}

  @UseGuards(JwtQueryAuthGuard)
  @SkipThrottle()
  @Sse('stream')
  stream(@Req() req: any): Observable<SseEvent> {
    const userId = req.user?.id || req.user?._id?.toString?.()

    return new Observable<SseEvent>((subscriber) => {
      // Register stream sink
      this.service.registerStream(userId, {
        next: (event) => subscriber.next(event),
        close: () => subscriber.complete(),
      })

      // Heartbeat every 25s to keep proxies alive
      const interval = setInterval(() => subscriber.next({ event: 'heartbeat', data: { ts: Date.now() } }), 25_000)

      return () => {
        clearInterval(interval)
        this.service.closeStream(userId)
      }
    })
  }
}