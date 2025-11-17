## Problem Diagnosis
- Backend `GET /requests/:id/providers` correctly requires JWT. The frontend fetch sometimes lacks `Authorization: Bearer <token>`, causing `401 Unauthorized` despite `NextAuth` session existing.
- Session to backend token bridging is not guaranteed at page mount; the fetch fires before `backendToken` (or `auth_token` in localStorage) is available.

## Backend (Validation Already Good)
- Keep `JwtAuthGuard` and `RolesGuard('customer')`. No change required.
- Endpoint already validates request ownership and returns providers with rating, review count, specialties.

## Frontend — Auth Bridging & Routing
1. Auth Token Readiness:
- Implement a small `useAuthTokenReady` hook that:
  - Reads `backendToken` from `useAuthStore` and localStorage `auth_token`.
  - Exposes `token`, `ready` boolean and a `waitForToken()` promise that resolves once token is available (with timeout fallback).
- In `/services/[serviceId]/providers/page.tsx`, wait for `ready` before calling `fetchProvidersForService(...)`. Show a loading state until ready, and if token is absent after timeout, show a sign‑in CTA (error state).

2. Route Guard UX:
- If not authenticated (`backendToken` missing) show a centered panel with CTA to `/auth` and defer the fetch.
- Preserve router history and Zustand state; only fire fetch when `ready` to avoid duplicate calls.

## Provider Selection Page — UI Completion
- Cards include: avatar, name, title, specialties, rating + review count, pricing range, availability.
- Sorting: rating, reviews, price min, availability; Filtering: min rating.
- Comparison: select up to 2 providers; show side‑by‑side comparison block.
- Approval: wire “Approuver” button to `POST /requests/:id/accept` with `providerId`, followed by success toast and navigation back (or highlight accepted state).

## Client Navigation
- History cards already link to `/services/${requestId}/providers` and track click.
- Zustand store preserves selection, filters and fetched providers across back/forward.
- Show skeletons and spinners both while waiting for auth token and during data fetches; disable buttons while loading.

## Analytics
- Use `trackEvent` utility:
  - Page view on mount: `trackEvent('providers_page_view', { requestId })`.
  - Card click: already `history_card_click`.
  - Provider select/compare toggles: `provider_compare_toggle` with providerId.
  - Approval: `provider_approve_click` with providerId and requestId.

## Error Handling
- Network/API errors: show red alert with guidance; allow retry.
- Auth errors (401/403): show specific messages and CTA.
- Gracefully handle empty provider lists.

## Consistency & Types
- Align with shared types (`Provider`, `Review`, `ServiceCategory`) while mapping backend response.
- Maintain Tailwind/gradient header style, spacing, badges consistent with existing pages.

## Implementation Steps
1. Create `useAuthTokenReady` hook and integrate into provider selection page load sequence.
2. Add page view analytics call and events for compare/approve.
3. Implement “Approuver” action calling backend `POST /requests/:id/accept` with error/success handling.
4. Add explicit auth guard UI panel when token missing.

## Acceptance Criteria
- Navigating from history card loads `/services/[id]/providers` without 401; loading state shows until auth token is available.
- Provider list shows details, sorting/filtering and comparison; approval works and persists.
- Analytics events emitted for page view, clicks, selections.
- Browser history and state preserved; proper errors surfaced.

## Next
- On approval, I will implement the auth readiness hook, wire approval API and analytics calls, and finalize loading/error states, keeping code style and architecture consistent with current patterns.