## Overview

* Target route: `apps/frontend/app/dashboard/provider/requests/all/page.tsx` (currently a simple placeholder) c:\Users\1\Darigo\apps\frontend\app\dashboard\provider\requests\all\page.tsx:1

* Reuse existing dashboard shell: `apps/frontend/app/dashboard/provider/layout.tsx` c:\Users\1\Darigo\apps\frontend\app\dashboard\provider\layout.tsx:7

* Consume shared request types from `packages/shared-types/src/request.ts` c:\Users\1\Darigo\packages\shared-types\src\request.ts:21

* Follow existing data access patterns via `features/requests/services/requests-service.ts` c:\Users\1\Darigo\apps\frontend\features\requests\services\requests-service.ts:96

## Architecture & Structure

* Keep Next.js App Router pages thin; build UI in reusable shared components.

* Use Atomic Design in `apps/frontend/shared/components/requests/*`:

  * Atoms: `status-badge`, `meta-row`, `list-empty`, `list-skeleton`

  * Molecules: `request-card`, `filters-bar`

  * Organisms: `requests-list`, `requests-grid` (optional), `requests-toolbar`

  * Template: `provider-requests-page`

* State (filters/sort/pagination) in `apps/frontend/shared/store/requests-ui-store.ts` using zustand.

* Data fetching stays in existing service layer `features/requests/services/requests-service.ts` and a thin hook `apps/frontend/shared/hooks/use-requests.ts` to map UI store + service.

* Styling uses Tailwind (consistent with current project). No new styling system.

### Page Composition Diagram

* ProviderRequestsPage (Template)

  * Header: title, optional KPI quick stats

  * Toolbar (Organism): FiltersBar + Refresh button

  * Content area:

    * Loading: ListSkeleton (Atom)

    * Error: ErrorView (existing) c:\Users\1\Darigo\apps\frontend\shared\components\error\error-view\.tsx:20

    * Empty: ListEmpty (Atom)

    * List (Organism): RequestsList

      * List items: RequestCard (Molecule)

        * StatusBadge (Atom)

        * MetaRow (Atom)

## Shared Types & Prop Typing

* All components typed using `Request`, `RequestStatus`, `ServiceCategory` from shared-types.

* Example props:

  * `RequestCardProps = { request: Request }`

  * `RequestsListProps = { items: Request[] }`

  * `FiltersBarProps = { status?: RequestStatus; category?: ServiceCategory; onChange: (next) => void }`

## State Management (zustand)

* Store location: `apps/frontend/shared/store/requests-ui-store.ts`.

* Store shape:

  * `status?: RequestStatus`, `category?: ServiceCategory`, `search?: string`, `sort?: 'newest'|'eta'|'category'`, `page: number`, `limit: number`

  * Actions: `setStatus`, `setCategory`, `setSearch`, `setSort`, `setPage`, `reset`

* Persistence: optional sync to `localStorage` for UX continuity (pattern matches `toast-store` usage) c:\Users\1\Darigo\apps\frontend\shared\store\toast-store.ts:28.

## Data Fetching & Caching

* Use existing `listMyRequests(params)` for provider’s requests c:\Users\1\Darigo\apps\frontend\features\requests\services\requests-service.ts:102.

* Hook `useRequests`:

  * Derives `offset = (page-1)*limit`.

  * Passes `status`, `offset`, `limit` to service.

  * Manages `loading`, `error` mapping aligned with `httpRequest` error conventions c:\Users\1\Darigo\apps\frontend\shared\utils\http.ts:21.

* Consider simple memoization by `status/page` to avoid flicker; advanced caching (SWR/RTK Query) is out of scope to keep pattern consistency.

## UI/UX Standards

* Responsive layout using Tailwind; grid/list switches at `sm/md/lg` breakpoints.

* Consistent palette and spacings (use existing `text-gray-*`, `bg-white`, `border-gray-*`).

* Keyboard navigation:

  * `FiltersBar` inputs/selects have `label` + `id` and are tab-order friendly.

  * List items are `article` with focus ring and actionable buttons accessible via keyboard.

* ARIA:

  * `aria-live="polite"` for loading state container.

  * Status badge uses `aria-label` with readable status text.

  * Toolbar buttons have `aria-label`.

## Performance Optimizations

* Virtualized list for large datasets via `react-window` (new dependency) to render visible rows only.

* Lazy-load heavy components (e.g., charts/KPIs) using Next `dynamic()`.

* `React.memo` for `RequestCard`, stable keys by `request.id`.

* Avoid unnecessary re-renders by reading zustand state slices.

## Styling Solution

* Tailwind utility classes only; no new CSS frameworks.

* Use existing `Button`, `Input`, etc. from `apps/frontend/shared/components/*` when available to keep consistency.

## Accessibility (WCAG 2.1 AA)

* Color contrast: use Tailwind classes that meet contrast ratios.

* Focus management: visible focus rings, skip links.

* Semantics: `section`, `header`, `main`, `article`, `ul/li` used appropriately.

* Announce loading/errors via `role="status"`/`role="alert"`.

## Third-Party Integration

* State: `zustand` (already present) c:\Users\1\Darigo\apps\frontend\package.json:35.

* Virtualization: add `react-window`.

* Forms: reuse `react-hook-form` where inputs exist c:\Users\1\Darigo\apps\frontend\package.json:26.

* Data viz: optional summary donut/bar via existing Nivo libs c:\Users\1\Darigo\apps\frontend\package.json:28.

## Testing

* Unit tests using Testing Library/Jest (already configured):

  * Render `RequestCard` with various statuses; verify labels, dates, and a11y roles.

  * `RequestsList` renders items and handles empty state.

  * `FiltersBar` triggers callbacks and keeps controlled values.

  * Hook `useRequests` handles success, loading, and error branches.

* File locations under `apps/frontend/__tests__/requests/*` following current convention.

## Storybook & Visual Regression

* Add Storybook to `apps/frontend`:

  * DevDeps: `@storybook/react`, `@storybook/addon-essentials`, `storybook` scripts.

  * `.storybook/main.ts`, `.storybook/preview.ts` with Tailwind and Next setup.

* Stories per component under `shared/components/requests/*/*.stories.tsx`.

* Visual regression via Chromatic or Storybook test runner; include a11y checks via `@storybook/addon-a11y`.

## Error & Loading States

* Loading: `ListSkeleton` with shimmer rows.

* Error: reuse `ErrorView` with specific message mapping (401/403) consistent with service error handling c:\Users\1\Darigo\apps\frontend\features\requests\hooks\useRequestsHistory.ts:41.

* Empty: `ListEmpty` with CTA (reuse `Button`).

## Implementation Steps

1. Create shared UI store `requests-ui-store.ts` with typed filters and actions.
2. Implement `useRequests` hook in `shared/hooks/use-requests.ts` consuming the store and `listMyRequests`.
3. Build atoms:

   * `status-badge` (maps `RequestStatus` → color/label)

   * `meta-row` (icon + label rows)

   * `list-skeleton`, `list-empty`
4. Build molecules:

   * `request-card` (typed `Request`)

   * `filters-bar` (status/category/search/sort; a11y labels)
5. Build organisms:

   * `requests-list` (virtualized if dataset is large; otherwise animated list with framer-motion)

   * `requests-toolbar` (icon, filters, refresh button)
6. Build page template `provider-requests-page` composing the above and wire into `page.tsx`.
7. Add unit tests under `apps/frontend/__tests__/requests/*` for atoms/molecules/organisms and hook.
8. Add Storybook, write stories for components; enable a11y addon.
9. Optional KPI header using Nivo charts, lazily loaded.
10. Run Lighthouse audits on the page; fix any contrast or performance issues.

## Integration Details

* API calls and auth headers must continue using `httpRequest` and `getAuthHeaders()` patterns c:\Users\1\Darigo\apps\frontend\features\requests\services\requests-service.ts:7.

* Maintain error message mapping consistent with existing hooks c:\Users\1\Darigo\apps\frontend\features\requests\hooks\useRequestsHistory.ts:41.

* Do not place new components in feature folders; use `shared/components/requests/*`.

## Deliverables

* Modular, typed shared components with stories and tests.

* Updated route rendering the new template with responsive/a11y-compliant UI.

* zustand store and hook for filters/pagination.

* Visual regression and Lighthouse reports with addressed findings.

## Confirmation

* On approval, I will implement the components, store, hook, tests, and stories, wire the page, and run cross-browser + accessibility checks, keeping all changes within the shared directories and existing patterns.

