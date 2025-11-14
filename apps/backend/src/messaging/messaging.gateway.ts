import { Injectable } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { OnEvent } from '@nestjs/event-emitter'
import { AppLogger } from '@/common/logging/logger.service'
import { MessagingService } from './messaging.service'

@WebSocketGateway({
  namespace: 'messages',
  cors: {
    origin: (process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? ['http://localhost:3000']),
    credentials: false,
  },
})
@Injectable()
export class MessagingGateway {
  @WebSocketServer() server: Server
  private readonly jwt: JwtService

  constructor(private readonly config: ConfigService, private readonly logger: AppLogger, private readonly messaging: MessagingService) {
    this.jwt = new JwtService({ secret: this.config.get<string>('JWT_SECRET') })
  }

  private toUserRoom(userId: string) {
    return 'user:' + String(userId)
  }

  private toThreadRoom(threadId: string) {
    return 'thread:' + String(threadId)
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
      client.join(this.toUserRoom(userId))
      try { client.emit('status', { status: 'open' }) } catch {}
      this.logger.info('Messages socket connected', { userId, socketId: client.id })
    } catch {
      try { client.emit('status', { status: 'error' }) } catch {}
      this.logger.warn('Messages socket auth failed', { socketId: client.id })
      client.disconnect(true)
    }
  }

  @SubscribeMessage('thread:join')
  async onThreadJoin(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    const threadId = String(body?.threadId || '')
    const userId = String(client.data?.userId || '')
    if (!threadId || !userId) return
    const ok = await this.messaging.isParticipant(threadId, userId)
    if (!ok) return
    client.join(this.toThreadRoom(threadId))
  }

  @SubscribeMessage('thread:leave')
  async onThreadLeave(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    const threadId = String(body?.threadId || '')
    if (!threadId) return
    client.leave(this.toThreadRoom(threadId))
  }

  @OnEvent('message.sent', { async: false })
  onMessageSent(payload: { threadId: string; message: any }) {
    try {
      this.server.to(this.toThreadRoom(payload.threadId)).emit('message:new', payload)
    } catch {}
  }

  @OnEvent('message.read', { async: false })
  onMessageRead(payload: { threadId: string; userId: string }) {
    try {
      this.server.to(this.toThreadRoom(payload.threadId)).emit('message:read', payload)
    } catch {}
  }
}

