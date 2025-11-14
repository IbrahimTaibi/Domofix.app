## Overview
- Implement Reviews and threaded Comments in the backend using NestJS + Mongoose, matching existing module layout, DTO validation, logging, auth, and shared types.
- Reuse `packages/shared-types` Review interface; add minimal Comment types if needed and export via `index.ts`.

## Data Model
- Review (matches shared types): `bookingId`, `customerId`, `providerId`, `serviceId`, `rating (1–5)`, `comment`, `images[]`, `createdAt`, `updatedAt`.
- Comment: `reviewId`, `parentCommentId?`, `authorId`, `content`, `createdAt`, `updatedAt`.
- Mongoose schemas with `@Schema({ timestamps: true })`; define indexes for common queries (`providerId`, `serviceId`, `customerId`, `reviewId`, `createdAt`).

## Module Structure
- `apps/backend/src/reviews/`
  - `schemas/review.schema.ts`, `schemas/comment.schema.ts`
  - `dto/` for `create/update` review/comment, list queries
  - `reviews.service.ts` business logic
  - `reviews.controller.ts` endpoints
  - `reviews.module.ts` wires models via `MongooseModule.forFeature`
- Register `ReviewsModule` in `AppModule`.

## Endpoints
- Reviews
  - `POST /reviews` (auth): create review; validate rating 1–5
  - `GET /reviews` (list): filters `providerId|serviceId|customerId`, `page`, `limit`, `sortOrder`
  - `GET /reviews/:id`
  - `PATCH /reviews/:id` (auth owner): update `rating`, `comment`, `images`
  - `DELETE /reviews/:id` (auth owner)
- Comments
  - `POST /reviews/:id/comments` (auth): add comment (optional `parentCommentId`)
  - `GET /reviews/:id/comments` (list): `page`, `limit`, optional `parentCommentId`

## Validation & Conventions
- DTOs use `class-validator` (whitelist/transform enabled globally).
- Use `JwtAuthGuard` for mutating routes; rely on `GlobalExceptionFilter` for consistent errors.
- Log actions via `AppLogger` (create/update/delete events).

## Business Logic
- ReviewsService
  - Create: persist review; emit minimal notification event (optional) using `NotificationsService`.
  - List: paginate with `.sort({ createdAt: -1 })` and `.skip/.limit`.
  - Update/Delete: owner checks via `customerId === userId`.
- Comments: add/list threaded comments with pagination; avoid deep tree assembly server-side for performance.

## Notifications (Optional Lightweight)
- Fire `notification.created` via `NotificationsService.create(...)` with type `system.message` and minimal payload (ids, rating). Controlled and non-blocking.

## Shared Types Alignment
- Reviews: reuse `packages/shared-types/src/service.ts` `Review` interface.
- Comments: propose adding `Comment` and `ListCommentsResponse` to shared types; backend maps Mongoose docs to these DTOs.

## Testing
- Unit tests: services with mocked `Model`s; validation edge cases.
- E2E tests: controller routes under auth; creation/list/update/delete flows.

## Rollout Steps
1. Create Mongoose schemas and indexes.
2. Add DTOs and validation.
3. Implement service logic and controller.
4. Wire module and register in `AppModule`.
5. Add unit/e2e tests.
6. Optional: integrate minimal notifications.

## Notes
- Keep Swagger out per current project direction.
- Follow existing pagination patterns and logging.

Confirm to proceed; implementation will strictly follow these conventions and file locations.