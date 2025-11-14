## Goals
- Implement Reviews and threaded Comments using Mongoose, aligned with existing module/DTO conventions
- Respect shared types, global validation, logging, auth, and notifications

## Data Model
- Review
  - fields: `subjectType`, `subjectId`, `authorId`, `rating (1–5)`, `title`, `content`, `status (pending|approved|rejected|flagged)`, `flagsCount`, `createdAt`, `updatedAt`
  - indexes: `{ subjectType, subjectId, createdAt }`, `{ authorId, createdAt }`, `{ status }`
- Comment
  - fields: `reviewId`, `parentCommentId (nullable)`, `authorId`, `content`, `status`, `createdAt`, `updatedAt`
  - indexes: `{ reviewId, createdAt }`, `{ parentCommentId }`
- Mongoose schemas: `@Schema({ timestamps: true })`, `SchemaFactory.createForClass`, define indexes in schema files

## Module Structure
- `apps/backend/src/reviews/`
  - `schemas/review.schema.ts`, `schemas/comment.schema.ts`
  - `dto/` for `create/update` review/comment, list queries, moderation actions
  - `reviews.controller.ts` with guarded endpoints
  - `reviews.service.ts` for business logic (inject `Model` via `@InjectModel`)
  - `reviews.module.ts` wiring `MongooseModule.forFeature` and providers

## Endpoints
- Reviews
  - `POST /reviews` (auth): create review (validate rating 1–5)
  - `GET /reviews` (list): filters `subjectType`, `subjectId`, `status`, `page`, `limit`
  - `GET /reviews/:id`
  - `PATCH /reviews/:id` (auth owner/mod): update title/content/rating/status
  - `DELETE /reviews/:id` (auth owner/mod)
- Comments
  - `POST /reviews/:id/comments` (auth): add comment (optional `parentCommentId`)
  - `GET /reviews/:id/comments` (list): `page`, `limit`, optional `parentCommentId` for thread drill-down
  - `POST /reviews/:id/moderate` (mod): action `approve|reject|flag`
  - `POST /comments/:id/moderate` (mod): same moderation actions

## Validation & DTOs
- Use `class-validator` with global pipe: DTOs in `dto/` implement constraints
- Common query DTOs: mirror `List*QueryDto` style (page/limit, optional filters)
- Consistent error responses via global exception filter

## Business Logic
- ReviewsService
  - create: persist, increment counters as needed, emit events
  - list: `.find().sort({ createdAt: -1 }).skip().limit()`
  - update/delete: auth owner or role-based; use `runInTransaction` if multi-step
  - moderate: update status, increment `flagsCount` on `flag`
- CommentsService (or inside ReviewsService if kept scoped)
  - add: support threaded by `parentCommentId`
  - list: sort/paginate, optional tree assembly deferred to client for performance

## Authentication & Authorization
- Apply `JwtAuthGuard` on mutating routes
- Optional `RolesGuard` for moderation endpoints (`role: 'admin' | 'moderator'`)

## Notifications Integration
- Emit events `review.created`, `comment.created`, `review.moderated`, `comment.moderated`
- Optionally call `NotificationsService.create(...)` using shared types (minimal payload: ids, subject, summary)

## Shared Types Alignment
- Reuse/update `packages/shared-types/src/service.ts` for `Review` and `Comment` domain types
- Export new types via `packages/shared-types/src/index.ts`

## Testing
- Unit tests: services with mocked `Model`s, validation edge cases
- E2E: controller routes with auth, happy-path and moderation

## Performance & Indexes
- Ensure proper compound indexes for common queries
- Avoid deep recursion on comments; prefer paginated child fetching

## Deliverables
- Reviews/Comments module with schemas, DTOs, service, controller
- Tests (unit + e2e) green
- Optional event-based notifications hook

## Rollout Steps
1. Create schemas and indexes (Mongoose)
2. Wire module and inject models
3. Implement DTOs and validation
4. Implement service logic and controller endpoints
5. Add unit/e2e tests and run them
6. Integrate minimal notifications (emit events)

Please confirm this plan; once approved, I’ll implement it following project conventions precisely.