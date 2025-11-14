## Goals
- Fix mobile horizontal scrolling by using a single-column layout and hiding side panels on small screens
- Show only recent messages by default with “Afficher plus/moins” controls
- Make the chat area wider on desktop by adjusting grid ratios

## Layout Changes (Page)
- File: `apps/frontend/app/dashboard/provider/messages/page.tsx`
- Container: add `overflow-x-hidden` to the outer section
- Grid:
  - Mobile: `grid-cols-1`
  - Desktop: `lg:grid-cols-[20rem_1.6fr_22rem]` (more space to chat)
- Panels:
  - Left (ConversationsList): stays visible on desktop; on mobile it remains first in the single column
  - Right (DetailsPanel): keep `hidden lg:block` so it’s not rendered on mobile

## Chat Window: Show More/Less
- File: `features/dashboard/provider/messages/components/chat-window.tsx`
- State: `visibleCount` default 15
- Derived: `visibleMessages = messages.slice(Math.max(0, messages.length - visibleCount))`
- Controls:
  - If `messages.length > visibleCount`, render a top button: “Afficher plus” → `visibleCount += 15` (until all shown)
  - When all are shown, render “Afficher moins” → reset to 15
- Auto-scroll:
  - Only when new messages are sent (i.e., appended) — do not auto-scroll on “Afficher plus” to avoid jumping
  - Track previous length in a ref; scroll when `messages.length > prevLength` and `visibleCount` unchanged

## Styling Adjustments
- Bubble width: increase to `max-w-[80%]` and keep concise paddings
- Chat padding: reduce side paddings to feel wider
- Ensure no fixed widths on mobile for side panels; rely on responsive classes

## Accessibility & UX
- Buttons: “Afficher plus/moins” use `aria-label` and are focusable
- Keep timestamps readable and semantic
- Maintain keyboard support in the composer

## Steps
1. Update page container (`overflow-x-hidden`) and grid columns
2. Implement show more/less logic in `ChatWindow` with ref-tracked auto-scroll
3. Increase bubble max width and tidy paddings
4. Validate mobile (no horizontal scroll; single-column) and desktop (wider chat)

## Acceptance Criteria
- No horizontal scrolling on mobile; only relevant panel visible
- Chat shows last ~15 messages by default; older messages load progressively
- Desktop chat area visibly wider without clipping or overflow
- Auto-scroll happens only on send, not when expanding history