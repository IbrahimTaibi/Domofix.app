## Overview
- Build a clean, information‑dense provider dashboard (Tableau de bord) with animated charts and KPI cards
- Use mock data initially; modular components under the provider feature directory
- Respect existing Next/Tailwind/Framer Motion stack and shared types
- Chart library: Recharts (lightweight, React‑native, animated)

## Dependencies
- Add `recharts` for charts
  - Install: `npm i recharts`

## File Structure (Frontend)
- `apps/frontend/features/dashboard/provider/components/dashboard/`
  - `types.ts` — local UI types aligned with `@darigo/shared-types`
  - `mock.ts` — mock data generators (revenue series, orders status, requests by category, activity feed)
  - `kpi-cards.tsx` — KPI grid with animated entry (Framer Motion)
  - `charts/revenue-trend.tsx` — Area/Line chart (Recharts) for revenue over time
  - `charts/orders-status-donut.tsx` — Donut/Pie chart for order status distribution
  - `charts/requests-category-bar.tsx` — Bar chart for requests by category (uses `ServiceCategory`)
  - `activity/recent-activity.tsx` — recent events list with icons (requests/orders/messages)
  - `tables/top-services.tsx` — table of top services (from shared types Service) with rating and counts
- Page composition
  - `apps/frontend/app/dashboard/provider/page.tsx` — assemble grid layout of components (cards + charts + lists)

## Component Details
- `types.ts`
  - Chart series types: `{ label: string; value: number; date?: string }` with strict typing
  - KPI card type: `{ title: string; value: string; delta?: string; icon?: ReactNode }`
- `mock.ts`
  - Functions: `makeRevenueSeries(days)`, `makeOrdersStatus()`, `makeRequestsByCategory()`, `makeRecentActivity()`, `makeTopServices()`
  - Values map to shared types: `ServiceCategory`, basic `Review` counts, `BookingStatus`
- `kpi-cards.tsx`
  - 4–6 KPIs: `Revenus (30j)`, `Demandes nouvelles`, `Commandes actives`, `Taux d’acceptation`, `Note moyenne`
  - Motion fade/slide on mount, subtle hover
- `charts/revenue-trend.tsx`
  - Recharts `ResponsiveContainer` + `AreaChart` with gradient fill, animated
  - Tooltip, axis labels, grid lines
- `charts/orders-status-donut.tsx`
  - Recharts `PieChart` with inner radius (donut), legend, animated slices
- `charts/requests-category-bar.tsx`
  - Recharts `BarChart` stacked or grouped by category (Plumber, Cleaner, etc.)
  - Axis and tooltip
- `activity/recent-activity.tsx`
  - List items with icon (Request, Order, Message), timestamp, short description
  - Mocked entries with realistic text
- `tables/top-services.tsx`
  - Table with service name, category, completed orders, avg rating, revenue
  - Sort by revenue by default

## Layout & Styling
- Tailwind grid: two‑column layout on desktop, single column on mobile
- Sections with cards (`bg-white rounded-xl border border-gray-200 shadow-sm`)
- Use existing `scrollbar-light` for lists; maintain hover/active semantics

## Integration & Types
- Leverage `@darigo/shared-types` for categories and shape references
- Keep UI types in `types.ts` mapped from shared types where applicable
- No backend calls; later hook to real data via services/store

## Animations & Performance
- Framer Motion for enter animations and minimal hover transitions
- Recharts built‑in animations; `ResponsiveContainer` for responsive charts
- Memoize derived data with `useMemo`; keep components pure

## Accessibility
- Chart titles labeled; legends and tooltips readable
- KPI cards with `aria-label` and semantic headings

## Implementation Steps
1. Install `recharts`
2. Add `types.ts` and `mock.ts` in dashboard folder
3. Implement KPI cards and three charts components
4. Implement recent activity and top services components
5. Compose dashboard in `page.tsx` with responsive grid
6. Verify build and design consistency

Confirm to proceed; I will implement the components, mock data, and the dashboard page using Recharts for animated charts.