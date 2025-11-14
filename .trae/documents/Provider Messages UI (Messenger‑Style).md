## Overview
- Build a Messenger‑style UI for `/dashboard/provider/messages` using the existing Next app layout
- Modular components under the provider feature; mock data/images initially; align to shared types conventions

## Page & Layout
- Route: `apps/frontend/app/dashboard/provider/messages/page.tsx`
- Three‑panel layout (responsive):
  - Left: conversations list (search + threads)
  - Middle: chat area (message bubbles, day separators, typing indicator)
  - Right: details panel (participant info, shared media/files)
- Mobile: collapsible panels; show list → chat → details via top tabs

## Components
- `features/dashboard/provider/messages/components/conversations-list.tsx`
  - Renders searchable list of threads (avatar, name, last message preview, time, unread badge)
  - Props: `threads: ThreadSummary[]`, `activeId`, `onSelect(id)`
- `features/dashboard/provider/messages/components/chat-header.tsx`
  - Avatar, display name, presence dot, quick actions
- `features/dashboard/provider/messages/components/chat-window.tsx`
  - Virtualized scroll list of messages
  - Grouped by day with separators; trailing read receipts; link previews
- `features/dashboard/provider/messages/components/message-bubble.tsx`
  - Variants: text, image, file; alignment by sender; timestamps; delivered/read indicators
- `features/dashboard/provider/messages/components/typing-indicator.tsx`
  - Dots animation (CSS) when other party typing
- `features/dashboard/provider/messages/components/chat-composer.tsx`
  - Text input + emoji button + attach button + send
  - Press Enter to send; Shift+Enter newline
- `features/dashboard/provider/messages/components/details-panel.tsx`
  - Participant card, shared media grid, shared files list

## Types (UI Layer)
- `features/dashboard/provider/messages/types.ts`
  - `ThreadSummary { id, title, avatarUrl, lastMessage, lastTime, unreadCount }`
  - `Message { id, threadId, senderId, senderName, senderAvatarUrl?, kind: 'text'|'image'|'file', text?, imageUrl?, file?, createdAt, status: 'sent'|'delivered'|'read' }`
  - `Participant { id, name, avatarUrl, role: 'customer'|'provider' }`
  - Align naming to `@darigo/shared-types` conventions (ids as strings, ISO dates)

## Mock Data
- `features/dashboard/provider/messages/mock.ts`
  - Seeded generators for `threads`, `messagesByThread(threadId)`, `participants`
  - Static avatar URLs (e.g., `/static/avatars/*` or `https://i.pravatar.cc/150?img=XX`)
  - Deterministic timestamps/delivery states to avoid hydration mismatches

## State & Hooks
- `features/dashboard/provider/messages/store.ts` (zustand)
  - `activeThreadId`, `threads`, `messages`, actions: `setActiveThread`, `sendMessage`, `markRead(threadId)`
- `features/dashboard/provider/messages/hooks/useChatMock.ts`
  - Simulate inbound messages/typing via `setTimeout` for demo; disabled on SSR

## Styling & UX
- Tailwind; light theme consistent with dashboard
- Bubbles: rounded, shadow‑sm; own vs other colors (primary vs gray)
- Day separators with date labels; sticky auto scroll to bottom on send
- Presence & notification dot (reuse `NotificationDot`) in header

## Accessibility
- Buttons with aria labels; semantic times; keyboard navigation in composer
- Screen reader labels for unread counts and attachments

## Future Integration (non‑mock)
- Wire to real messages service: SSE or Socket.IO hook similar to notifications
- Paginated message fetch with cursor; optimistic send status updates

## Implementation Steps
1. Create `types.ts` and `mock.ts` with seeded data
2. Implement list/header/window/bubble/composer/details components
3. Compose page with responsive grid
4. Add zustand store and mock hook for typing/inbound
5. Validate hydration (avoid time‑dependent values during SSR)

Confirm to proceed; I’ll implement the components, mock data, and page in the specified paths with a Messenger‑style UI.