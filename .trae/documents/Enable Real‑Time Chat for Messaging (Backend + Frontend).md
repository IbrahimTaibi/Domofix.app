## Overview
Implement real‑time chat on top of the existing threaded messaging system. Add a Socket.IO gateway for messages in the backend, wire optimistic updates and live events in the frontend, and align with current auth/state patterns.

## Backend — Message Gateway
1. Create `apps/backend/src/messaging/messaging.gateway.ts`:
   - `@WebSocketGateway({ namespace: 'messages', cors: { origin: <CORS_ORIGINS>, credentials: false } })`.
   - Authenticate handshake with JWT (reuse logic from `notifications.gateway.ts`). Extract `userId` → `client.join(user:<id>)`.
2. Rooms & Subscriptions:
   - Per‑thread room key: `thread:<threadId>`.
   - Add server event handlers:
     - `thread:join` → validate participant; `client.join(thread:<id>)`.
     - `thread:leave` → `client.leave(thread:<id>)`.
3. Message Events:
   - On `MessagingService.sendMessage(...)` emit Nest event `message.sent` with payload `{ threadId, message }`.
   - In gateway: `@OnEvent('message.sent')` → `server.to(thread:<id>).emit('message:new', payload)`.
   - Read receipts: on `markRead(...)` emit `message.read` → gateway `server.to(thread:<id>).emit('message:read', { userId, threadId })`.
   - Optional: typing indicator events (`typing:start`, `typing:stop`) with short TTL (rate‑limited).
4. Validation & Limits:
   - Validate user participation before joining rooms.
   - Reuse rate limiting in `MessagingService.ensureCanSend`.
   - Keep file validation unchanged; do not stream binaries over socket.
5. Config:
   - Reuse `JWT_SECRET`, `CORS_ORIGINS`.
   - Ensure gateway is exported by `messaging.module.ts`.
6. Tests:
   - E2E: connect → join thread → send message via REST → receive `message:new` on socket.
   - Negative: non‑participant join denied; invalid token disconnect.

## Frontend — Socket Client & Store
1. Hook: `apps/frontend/shared/hooks/use-messages-socket.ts`:
   - Connect to `ws://<api>/messages` using `socket.io-client` with JWT from `auth-store`.
   - Expose `joinThread(threadId)`, `leaveThread(threadId)`, and events subscriptions.
   - Listen to `message:new`, `message:read`, `typing:start/stop` and forward to store.
2. Store Integration:
   - Extend `apps/frontend/features/dashboard/provider/messages/store.ts`:
     - Actions: `addMessage(message)`, `setRead(threadId, userId)`, `setTyping(threadId, userId, on)`, and `optimisticSend(text|image|file)`.
     - Keep consistent types in `features/dashboard/provider/messages/types.ts`.
3. UI Wiring:
   - In `features/dashboard/provider/messages/components/chat-window.tsx` and `chat-composer.tsx`:
     - On thread selection: `joinThread(...)` and subscribe; on unmount: `leaveThread(...)`.
     - On send: optimistic push with `status='sent'`, then confirm when backend emits/returns. Handle error by reverting.
     - Show typing indicator via existing `typing-indicator.tsx`.
4. Error Handling & Reconnect:
   - Auto reconnect with exponential backoff; display a banner when disconnected.
   - Debounce typing events; throttle subscription changes.

## Security & Compliance
- Enforce participant checks server‑side before joining thread rooms.
- JWT validated at handshake like notifications; disconnect invalid clients.
- No PII leakage in events; emit only message fields already exposed by REST.
- Respect existing order status gates (canceled/completed grace period).

## Performance
- Emit to per‑thread rooms only; avoid global fanout.
- Keep payloads small; paginate history with REST, use socket for deltas.
- Client merges events into store with minimal re‑renders.

## Configuration
- Backend: ensure `messaging.gateway.ts` is part of `MessagingModule`.
- Frontend: reuse `NEXT_PUBLIC_API_URL` to build socket endpoint.
- CORS: include frontend origin in `CORS_ORIGINS`.

## Testing & QA
- Unit tests for gateway event mappings.
- E2E: create thread → join room → send → receive; read → receipt.
- Frontend integration test: hook connects and dispatches store actions on `message:new`.

## Rollout
- Ship behind an env flag `ENABLE_MESSAGES_SOCKET=true` to allow staged rollout.
- Monitor logs and socket connection metrics; fall back to REST polling on failure.

## Acceptance Criteria
- When a user sends a message, the other participant receives `message:new` in under 1 second without manual refresh.
- Read receipts propagate and update UI in real time.
- Typing indicator appears/disappears smoothly with proper throttling.
- Security: non‑participants cannot join a thread; invalid tokens are disconnected.

## Next Steps
- On approval, I will implement the gateway, hook, store updates, UI bindings, tests, and config changes as outlined above, keeping code style and architecture consistent with notifications and messaging modules.