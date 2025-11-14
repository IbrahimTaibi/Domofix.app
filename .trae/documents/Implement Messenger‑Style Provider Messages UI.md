## Overview
- Create a Facebook Messenger‑style UI at `/dashboard/provider/messages` with three panels: conversations list, chat window, details panel
- Use seeded mock data/images to avoid hydration mismatches and match project conventions

## Files & Structure
- `features/dashboard/provider/messages/types.ts` — UI types (ThreadSummary, Message, Participant)
- `features/dashboard/provider/messages/mock.ts` — deterministic mock data
- Components:
  - `components/conversations-list.tsx` — searchable threads with avatars, last message, time, unread badge
  - `components/chat-header.tsx` — participant info, presence indicator
  - `components/message-bubble.tsx` — bubbles for own/other (text, image, file), timestamps, status
  - `components/chat-window.tsx` — messages list with day separators and auto-scroll
  - `components/typing-indicator.tsx` — animated dots
  - `components/chat-composer.tsx` — input + emoji + attach + send
  - `components/details-panel.tsx` — participant card, shared media grid, files list
- `features/dashboard/provider/messages/store.ts` — zustand store for active thread/messages
- `app/dashboard/provider/messages/page.tsx` — assemble responsive layout

## UX & Styling
- Tailwind light theme; bubbles rounded with subtle shadows
- Left panel fixed width on desktop; collapsible on mobile
- Reuse `NotificationDot` for presence when applicable

## Mock Behavior
- Seeded timestamps and values; optional typing simulation via a client-only hook
- Initial threads/messages generated deterministically; no backend calls

## Steps
1. Add types and mock generators
2. Implement components (list, header, window, bubble, composer, details)
3. Compose the page and wire store/select thread/send message
4. Validate SSR consistency (seeded data), run dev to verify UI

Confirm to proceed; upon approval I will implement all components and the page with mock data and images.