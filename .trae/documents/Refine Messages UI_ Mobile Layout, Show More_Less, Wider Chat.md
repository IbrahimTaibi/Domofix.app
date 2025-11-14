## Goals
- Fix mobile horizontal scrolling by using a single-column layout, removing fixed widths, and hiding side panels on small screens
- Show only recent messages by default; reveal older messages with a “Afficher plus” toggle (and “Afficher moins” to collapse)
- Make the chat area wider on desktop by adjusting grid column ratios

## Layout Changes
- `app/dashboard/provider/messages/page.tsx`
  - Mobile: `grid-cols-1`, ensure `overflow-x-hidden` on the page container
  - Desktop: adjust columns to give more space to chat (e.g., `lg:grid-cols-[20rem_1.4fr_22rem]`)
  - Keep `DetailsPanel` hidden on mobile (`hidden lg:block`), ConversationsList collapsible only on mobile if needed

## Chat Window (Show More/Less)
- `components/chat-window.tsx`
  - Accept props: `messages`, `me`
  - Add local state: `visibleCount` default to last 15 messages
  - Compute `visibleMessages = messages.slice(Math.max(0, messages.length - visibleCount))`
  - If older exist (`messages.length > visibleCount`), render a top button:
    - “Afficher plus” → increases `visibleCount` by 15 until all are shown
    - When all shown, show “Afficher moins” → resets `visibleCount` to 15
  - Maintain auto-scroll only when sending new messages (avoid jumping when expanding history)

## Style Adjustments
- Ensure no fixed pixel widths in the mobile view for the side panels; use responsive classes
- Add `overflow-x-hidden` to the page section/container to prevent horizontal scroll
- Chat area padding and bubble max width increased (e.g., `max-w-[80%]`) to make chat feel wider; reduce side paddings

## Accessibility & UX
- Buttons for show more/less have clear labels and are focusable
- Do not trigger auto-scroll on “Afficher plus” (so user remains at the expansion point)

## Implementation Steps
1. Update page grid template and container overflow
2. Update `ChatWindow` with show more/less logic and adjust bubble widths
3. Validate on mobile (no horizontal scroll, only chat visible)
4. Validate on desktop (wider chat, side panels intact)

Confirm to proceed; I’ll implement these changes in the indicated files to match the desired behavior.