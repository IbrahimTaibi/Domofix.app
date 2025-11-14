## Overview

* Build a clean, consistent provider-facing page at `/dashboard/provider/requests/all` listing actionable requests with strong UX

* Use shared types (`@darigo/shared-types/request`) and follow existing feature modularity

## Page & Structure

* Route: `apps/frontend/app/dashboard/provider/requests/all/page.tsx`

* Components under `features/dashboard/provider/requests/all/`:

  * `filters.tsx` — status/category/date range filters, keyword search

  * `requests-list.tsx` — virtualized or paginated list

  * `request-card.tsx` — card per request with key info and actions

  * `pagination.tsx` — page/limit controls

  * `empty-state.tsx`, `error-state.tsx`, `loading-skeleton.tsx`

* Hooks under `features/dashboard/provider/requests/hooks/`:

  * `useRequests.ts` — fetch list w/ query params (page, limit, status, category, q)

  * `useApplyForRequest.ts`, `useAcceptRequest.ts` — POST actions

## Data & Types

* Import shared `Request` interfaces from `@darigo/shared-types` (request.ts)

* List API: `GET /requests` (provider uses non-customer list with filters) or a provider-all endpoint if needed

* Actions:

  * Apply: `POST /requests/:id/apply` (uses `apply-for-request.dto.ts`)

  * Accept (if already applied/selected): `POST /requests/:id/accept-provider` (uses `accept-provider.dto.ts`)

## UI Details

* Filters row (sticky on top)

  * Status: `Open`, `Accepted`, `Completed`

  * Category: `plumber`, `electrician`, `cleaner`, `gardener`, `carpenter`

  * Search box: keyword by address/category/details

  * Date range: estimated time window

* Request card

  * Title: category + city

  * Subtitle: address (fullAddress) and distance (if lat/lon available; optional later)

  * Meta: ETA, phone masked, status pill, applied indicator

  * Actions: `Apply`, `View`, `Accept` (conditional), disabled states for completed

* List behavior

  * Paginated (page, limit) with totals; show count

  * Skeleton on load, empty state when no results

  * Error banner for network issues

* Accessibility & UX

  * Focus states on buttons, semantic headings, readable labels

  * <br />

