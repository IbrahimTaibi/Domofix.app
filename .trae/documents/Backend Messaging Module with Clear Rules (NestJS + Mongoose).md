## Overview
- Implement a backend Messaging module aligned with NestJS + Mongoose patterns and shared types
- Tie threads to Orders (not bookings) and enforce clear rules for when messaging is allowed

## Data Model (Mongoose)
- Thread
  - `orderId: ObjectId` (ref: `Order`)
  - `participants: [{ userId: ObjectId, role: 'customer'|'provider' }]`
  - `status: 'open'|'archived'|'blocked'`
  - `lastMessageAt: Date`
  - `unreadCounts: Record<string, number>`
  - Indexes: `{ orderId: 1 }`, `{ participants.userId: 1, lastMessageAt: -1 }`, unique per `(orderId, providerId, customerId)`
- Message
  - `threadId: ObjectId` (ref: `Thread`)
  - `senderId: ObjectId`
  - `kind: 'text'|'image'|'file'`
  - `text?`, `imageUrl?`, `fileMeta? { name, size, mime }`
  - `createdAt: Date`, `status: 'sent'|'delivered'|'read'`
  - Index: `{ threadId: 1, createdAt: -1 }`

## Messaging Rules (When/Who)
- Participants:
  - Only the order’s customer and provider may message in that thread
  - Admin/moderator may archive/block threads
- Order status gates:
  - Allowed: `assigned`, `in_progress`
  - `completed`: allow for a grace window (e.g., 7 days) then auto‑archive
  - `canceled`: block messaging (403)
- Content/attachments:
  - Text ≤ 2,000 chars
  - Allowed mime: `image/*`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Size ≤ 10MB per file, total ≤ 20MB per message
  - Hook for malware scanning (placeholder)
- Rate limits & abuse:
  - Per‑thread: 30 messages / 5 minutes → 429 on exceed
  - Daily per user cap (configurable)
  - Blocklist support: thread `status='blocked'`
- Read receipts & unread:
  - Mark read updates per‑user `unreadCounts` and emits `thread.read`

## API Endpoints (REST)
- Threads
  - `POST /threads` (auth): create or get thread for `(orderId, participants)`; ensure unique
  - `GET /threads` (auth): list caller’s threads; filters by `status`, paginated
  - `GET /threads/:id` (auth): details + summary
  - `POST /threads/:id/archive` (auth, participant/mod): archive
- Messages
  - `GET /threads/:id/messages` (auth): paginated by `createdAt` cursor
  - `POST /threads/:id/messages` (auth): send message (enforce rules)
  - `POST /threads/:id/read` (auth): mark read

## Module Structure
- `apps/backend/src/messaging/`
  - `schemas/thread.schema.ts`, `schemas/message.schema.ts`
  - DTOs: `create-thread.dto.ts`, `list-threads.query.ts`, `send-message.dto.ts`, `list-messages.query.ts`, `mark-read.dto.ts`
  - `messaging.service.ts`: rule enforcement, send/list/read, unread counts
  - `messaging.controller.ts`: endpoints with `JwtAuthGuard` (and `RolesGuard` when needed)
  - `messaging.module.ts`: wire Mongoose models

## Integrations
- Orders: validate `Order.status` against allowed set before send
- Notifications: emit `message.sent`, optionally `NotificationsService.create({ type: 'system.message' })`
- Real‑time: prepare events for SSE/WebSocket gateway (broadcast to participants)

## Shared Types
- Extend `@darigo/shared-types` with messaging interfaces:
  - `ThreadSummary`, `Message`, `MessageKind`, `MessageStatus`, `ThreadStatus`
  - Export via `index.ts` and align frontend types

## Validation & Errors
- Use `class-validator` on DTOs; throw `AppError` variants (`AuthorizationError`, `ValidationError`, `RateLimitError`)
- GlobalExceptionFilter maps to consistent responses

## Testing
- Unit: participant checks, order status gates, size/mime validation, rate limits
- E2E: create thread → send → list → read → archive; forbidden paths (canceled order, non‑participant)
- Performance: index checks, pagination under load

## Implementation Steps
1. Add schemas and indexes; wire module
2. Implement DTOs and service rule checks (order status, participants, rate limits)
3. Implement controller endpoints with guards
4. Hook lightweight notifications; emit domain events
5. Add unit/E2E tests for rules and happy paths
6. Optional: integrate SSE/WebSocket broadcast

## Acceptance Criteria
- Messaging only between order participants within allowed statuses
- Blocked when order canceled or thread blocked; archived after grace window post‑completion
- Unread counts and read receipts maintained
- Tests cover rule enforcement and core flows

Confirm to proceed and I’ll implement the module following these specifications.