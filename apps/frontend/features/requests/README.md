# Requests Feature

This feature implements the customer-facing Request Service page.

## Architecture

- `components/`
  - `request-service-form.tsx`: Accessible, responsive form using shared UI components.
- `hooks/`
  - `useRequestService.ts`: Encapsulates request creation with loading/error state and caching.
- `services/`
  - `requests-service.ts`: Integrates with backend REST endpoints using shared `httpRequest`.
- `store/`
  - `request-store.ts`: Zustand stores for form draft (persisted) and last created request.

## API Integration

Backend (NestJS):
- `POST /requests` (customer): create request
- `POST /requests/:id/apply` (provider): apply to request
- `POST /requests/:id/accept` (customer): accept provider
- `PATCH /requests/:id/complete` (customer or accepted provider): complete request

Auth:
- Uses `Authorization: Bearer <token>` header; token stored in `localStorage` by the global API client.

## Types

Shared types from `@darigo/shared-types`:
- `CreateRequestRequest`, `Request`, `RequestStatus`, `ServiceCategory`.

## State Management

- **Zustand** is used for:
  - Persisted draft form values (`darigo_request_draft`) for a better UX across navigation.
  - Ephemeral `lastRequest` to show immediate feedback after submission.

## Validation

- Uses the shared `useValidation` hook for simple, composable client-side validation.
- Server-side validation is enforced by backend DTOs (class-validator).

## Accessibility

- Labels, error messaging, and `aria-*` attributes are included where relevant.
- Keyboard and screen-reader friendly form structure.

## Notes / Future Work

- Backend currently does not expose list/get/update/delete endpoints for Requests; UI focuses on creation and feedback.
- Consider adding `GET /requests` and `GET /requests/:id` to allow full CRUD in the future.