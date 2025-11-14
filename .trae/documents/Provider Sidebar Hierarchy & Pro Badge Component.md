## Goals
- Reorganize provider dashboard sidebar into clearer sections/subsections (French labels preserved)
- Create a reusable ProBadge component (not used yet), ready for future placement

## Proposed Hierarchy
- Tableau de bord (`/dashboard/provider`)
- Demandes (`/dashboard/provider/requests`)
  - Toutes les demandes (`/dashboard/provider/requests/toutes`)
  - À proximité (`/dashboard/provider/requests/proximite`)
  - Urgentes (`/dashboard/provider/requests/urgentes`)
  - En cours (`/dashboard/provider/requests/en-cours`)
  - Mes candidatures (`/dashboard/provider/requests/candidatures`) — optional, if concept exists
- Commandes (`/dashboard/provider/orders`) — aligns with backend Orders
  - Actives (`/dashboard/provider/orders/actives`)
  - Terminées (`/dashboard/provider/orders/terminees`)
- Messages (`/dashboard/provider/messages`)
- Facturation (`/dashboard/provider/billing`)
  - Factures (`/dashboard/provider/invoices`)
  - Paiements (`/dashboard/provider/billing/paiements`)
  - Abonnements (`/dashboard/provider/settings/abonnements`) — can be moved here for clarity
- Stock (`/dashboard/provider/stock`)
- Équipe (`/dashboard/provider/team`)
- Support (`/dashboard/provider/support`)
  - Assistance (`/dashboard/provider/support/assistance`)
  - Signaler un bug (`/dashboard/provider/support/bug`)
  - Centre d’aide (`/dashboard/provider/support/help`)
- Paramètres (`/dashboard/provider/settings`)
  - Profil (`/dashboard/provider/settings/profile`)
  - Préférences (`/dashboard/provider/settings/preferences`)

## Technical Changes
- Update the sections array in `apps/frontend/features/dashboard/provider/components/sidebar.tsx` to the proposed structure
- Keep `SidebarMenuSections` and `SidebarMenu` components unchanged (they already support nesting and active/hover behavior)

## Pro Badge Component (not used yet)
- Path suggestion: `apps/frontend/shared/components/badges/pro-badge.tsx`
- API: `ProBadge({ size?: 'sm'|'md', className?: string })`
- Style: gradient background (primary→indigo), small uppercase text, rounded pill, accessible role
- No usage now; you will instruct where to place later

## Routing Notes
- Stick to existing routes for current pages; add non-breaking placeholder routes only where helpful
- Ensure icons: keep current `lucide-react` icons; adjust as needed (e.g., `ClipboardList`/`List`, `CreditCard`, `FileText`, `Users`)

## Implementation Steps
1. Refactor `sections` constant in `sidebar.tsx` to the new hierarchy
2. Create `ProBadge` component in shared components (no imports used yet)
3. Verify active/hover in sidebar remain consistent (already fixed)

Confirm to proceed; once approved, I’ll implement the menu hierarchy and add the ProBadge component without using it yet.