import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OnEvent } from '@nestjs/event-emitter'
import { AppLogger } from '@/common/logging/logger.service'

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: (process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? ['http://localhost:3000']),
    credentials: false,
  },
})
@Injectable()
export class NotificationsGateway {
  @WebSocketServer() server: Server
  private readonly jwt: JwtService
  private readonly userRoomPrefix = 'user:'

  constructor(private readonly config: ConfigService, private readonly logger: AppLogger) {
    this.jwt = new JwtService({ secret: this.config.get<string>('JWT_SECRET') })
  }

  private toRoom(userId: string) {
    return this.userRoomPrefix + String(userId)
  }

  async handleConnection(client: Socket) {
    try {
      const auth = (client.handshake.auth as any) || {}
      const query = (client.handshake.query as any) || {}
      const headers = (client.handshake.headers as any) || {}
      const headerAuth = (headers['authorization'] || headers['Authorization'] || '') as string
      const token: string | undefined = auth.token || query.token || (headerAuth.startsWith('Bearer ') ? headerAuth.slice(7) : undefined)
      if (!token) throw new Error('Missing token')
      const payload: any = await this.jwt.verifyAsync(token)
      const userId = String(payload?.sub || payload?.userId || payload?.id || '')
      if (!userId) throw new Error('Invalid token payload')
      client.data.userId = userId
      client.join(this.toRoom(userId))
      try { client.emit('status', { status: 'open' }) } catch {}
      this.logger.info('Socket connected', { userId, socketId: client.id })
    } catch (err) {
      try { client.emit('status', { status: 'error' }) } catch {}
      this.logger.warn('Socket auth failed', { socketId: client.id })
      client.disconnect(true)
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.info('Socket disconnected', { userId: client.data?.userId, socketId: client.id })
  }

  // Broadcast newly created notifications to user room
  @OnEvent('notification.created', { async: false })
  onNotificationCreated(notification: any) {
    try {
      const room = this.toRoom(notification.userId)
      this.server.to(room).emit('notification', { event: 'notification', data: notification })
    } catch {}
  }

  @OnEvent('notification.read', { async: false })
  onNotificationRead(payload: { userId: string; id: string; readAt?: string | null }) {
    try {
      const room = this.toRoom(payload.userId)
      this.server.to(room).emit('notification.read', payload)
    } catch {}
  }

  @OnEvent('notifications.read_all', { async: false })
  onNotificationsReadAll(payload: { userId: string }) {
    try {
      const room = this.toRoom(payload.userId)
      this.server.to(room).emit('notifications.read_all', payload)
    } catch {}
  }

  @OnEvent('notification.deleted', { async: false })
  onNotificationDeleted(payload: { userId: string; id: string }) {
    try {
      const room = this.toRoom(payload.userId)
      this.server.to(room).emit('notification.deleted', payload)
    } catch {}
  }
}