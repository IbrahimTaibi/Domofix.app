## Goal
- Add a simple, safe seed pipeline that empties the database, then inserts realistic sample data for core features (Users, Provider Applications, Requests, Orders, Notifications, Reviews/Comments, Messaging threads/messages)

## Approach
- Create a TypeScript seed script under `apps/backend/src/seeds/seed.ts` that:
  1) Connects to MongoDB via `MONGODB_URI`
  2) Empties collections using `deleteMany({})`
  3) Inserts sample documents with consistent relations
  4) Closes the connection
- Avoid new dependencies; use existing Mongoose schemas
- Wire scripts in `apps/backend/package.json` as `seed:reset` and `seed:run` (both execute the same script, with a `--force` flag for reset safety)

## Data Model Coverage
- Users: a few customers and providers
- Provider Applications: for some providers
- Requests: mix of address+lat/lon and direct lat/lon; some OPEN/PENDING/ACCEPTED/COMPLETED
- Orders: derived from ACCEPTED requests (ASSIGNED/IN_PROGRESS/COMPLETED)
- Notifications: basic info messages for users
- Reviews/Comments: reviews for providers/services with a few comments
- Messaging: threads tied to orders with two‑way messages

## Script Structure (seed.ts)
- Import Mongoose and entity schemas:
  - Users: `users/schemas/user.schema`
  - Provider Applications: `provider-applications/schemas/...`
  - Requests: `requests/schemas/request.schema`
  - Orders: `orders/schemas/order.schema`
  - Notifications: `notifications/schemas/...`
  - Reviews/Comments: `reviews/schemas/...`
  - Messaging: `messaging/schemas/...`
- Build models: `mongoose.model(name, schema)`
- Reset step: `deleteMany({})` on each model in safe order (child collections first optional)
- Insert step:
  - Create users and keep their `_id`s
  - Create requests linked to customer
  - Accept some requests: set `acceptedProviderId` and create matching orders
  - Notifications for events
  - Reviews: author=customer, subject=provider/service, with comments
  - Threads/messages linked to orders and participant user ids

## Safety
- Require `NODE_ENV !== 'production'` OR a `SEED_ALLOW=1` env to proceed
- Log counts before/after

## Scripts
- Add to `apps/backend/package.json`:
  - `"seed": "ts-node src/seeds/seed.ts"`
  - Optional `"seed:reset": "ts-node src/seeds/seed.ts --force"`

## Result
- One command to reset and seed realistic data, ready for local development and demos.

Confirm to proceed; I’ll implement the seed script, wire the npm command, and populate consistent sample data across all modules.