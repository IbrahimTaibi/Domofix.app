# Widget System - Integration Guide

## Overview

The widget is a global chat interface that allows customers and providers to communicate in real-time. It automatically manages thread lifecycle based on order status.

## Features

- ✅ **Real-time messaging** via Socket.IO
- ✅ **Auto-open on provider acceptance**
- ✅ **Read-only mode** for completed/cancelled orders
- ✅ **Unread message badges**
- ✅ **System messages** for thread creation
- ✅ **Auth-gated** (only shows for logged-in users)
- ✅ **Loading states** and error handling

## Architecture

```
widget/
├── components/          # UI components
│   ├── widget.tsx      # Main widget container
│   ├── bottom-nav.tsx  # Navigation tabs
│   ├── messages/       # Message components
│   └── screens/        # Home, Messages, Help screens
├── store/              # State management (Zustand)
│   ├── widget-store.ts # Widget UI state
│   └── messages-store.ts # Messages data & logic
├── services/           # API layer
│   └── widget-messaging-service.ts
├── hooks/              # Custom hooks
│   └── useWidgetSocket.ts
├── events/             # Event bus for cross-component communication
│   └── widget-events.ts
└── types/              # Type definitions & adapters
    └── index.ts
```

## Auto-Opening Widget When Customer Accepts Provider

### Usage Example

When a customer accepts a provider, you should trigger the widget to auto-open:

```typescript
import { openWidgetForOrder } from '@/features/widget/events/widget-events'

// In your provider acceptance handler:
async function handleAcceptProvider(providerId: string) {
  try {
    // 1. Accept the provider via API
    const response = await acceptProvider(requestId, providerId)

    // 2. Get the order ID and request display ID from the response
    const orderId = response.orderId
    const requestDisplayId = response.displayId // e.g., "R-12345"

    // 3. Trigger widget to auto-open
    openWidgetForOrder(orderId, requestDisplayId)

    // Widget will:
    // - Open automatically
    // - Switch to messages tab
    // - Load the thread for this order
    // - Show a system message: "Cette conversation est liée à la demande R-12345..."

  } catch (error) {
    console.error('Failed to accept provider:', error)
  }
}
```

### Integration Points

**Where to add this:**
- Customer request detail page (when accepting a provider)
- Provider selection flow
- Any UI where users can approve/start an order

**Required data:**
- `orderId`: The order ID created when provider is accepted
- `requestDisplayId`: The user-friendly request ID (e.g., "R-12345")

## Read-Only Mode

Threads automatically become read-only when:
- Order status is `completed`
- Order status is `canceled`
- Thread status is `archived`
- Thread status is `blocked`

The chat composer will show a lock icon with message: "Cette conversation est fermée"

## Socket.IO Events

The widget listens to these real-time events:

### Incoming Events
- `message:new` - New message in any thread
- `message:read` - Message marked as read
- `connect` - Socket connected
- `disconnect` - Socket disconnected

### Outgoing Events
- `thread:join` - Join a thread room
- `thread:leave` - Leave a thread room

## API Endpoints Used

- `GET /threads` - List all threads
- `GET /threads/:id/messages` - Get messages for a thread
- `POST /threads/:id/messages` - Send a message
- `POST /threads/:id/read` - Mark thread as read

## State Management

### Widget Store (`useWidgetStore`)
```typescript
{
  open: boolean          // Widget visibility
  tab: 'home' | 'messages' | 'help'
  setOpen: (v: boolean) => void
  setTab: (t: WidgetTab) => void
}
```

### Messages Store (`useMessagesStore`)
```typescript
{
  threads: WidgetThread[]
  messagesByThread: Record<string, WidgetMessage[]>
  activeThreadId: string | null
  isLoadingThreads: boolean
  isLoadingMessages: Record<string, boolean>
  isSending: boolean
  error: string | null

  // Actions
  loadThreads: (userId: string) => Promise<void>
  loadMessages: (threadId: string) => Promise<void>
  setActiveThread: (threadId: string, userId: string) => Promise<void>
  backToList: () => void
  sendMessage: (text: string) => Promise<boolean>
  openThreadForOrder: (orderId, displayId, userId) => Promise<void>
}
```

## Type Adapters

The widget uses simplified types internally and adapts backend types:

- `ThreadSummary` → `WidgetThread` (via `toWidgetThread`)
- `ChatMessage` → `WidgetMessage` (via `toWidgetMessage`)

This separation ensures clean UI code that's decoupled from backend schema changes.

## Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] Widget doesn't show when logged out
   - [ ] Widget appears after login

2. **Thread List**
   - [ ] All threads load on mount
   - [ ] Unread badges show correct count
   - [ ] Clicking thread opens conversation

3. **Messaging**
   - [ ] Can send text messages
   - [ ] Messages appear in real-time
   - [ ] Auto-scroll to latest message
   - [ ] Loading spinner shows while sending

4. **Auto-Open**
   - [ ] Widget opens when provider accepted
   - [ ] Switches to messages tab
   - [ ] Shows correct thread
   - [ ] System message appears

5. **Read-Only Mode**
   - [ ] Completed orders show lock icon
   - [ ] Can't send messages to closed threads
   - [ ] Shows "Cette conversation est fermée"

6. **Real-time**
   - [ ] New messages from other user appear instantly
   - [ ] Unread count updates in real-time
   - [ ] Socket reconnects after network loss

## Troubleshooting

### Widget doesn't open
- Check user is authenticated (`useAuthStore.user` is not null)
- Check console for errors
- Verify `auth_token` in localStorage

### Messages don't load
- Check network tab for API errors
- Verify backend `/threads` endpoint is working
- Check authentication headers

### Socket not connecting
- Verify `NEXT_PUBLIC_API_URL` env variable
- Check Socket.IO server is running
- Inspect browser console for connection errors

### Auto-open not working
- Verify `openWidgetForOrder` is called with correct params
- Check `orderId` exists in database
- Ensure thread was created by backend listener
