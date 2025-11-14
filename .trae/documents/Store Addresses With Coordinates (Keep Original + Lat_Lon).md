## Findings
- Users: `User.address` already includes `latitude`, `longitude`, and `fullAddress` (users/schemas/user.schema.ts:78–106, 138–141).
- Requests: `Request.address` (same Address sub-schema) plus a separate `location` subdoc with `latitude`, `longitude`, and components (requests/schemas/request.schema.ts:53–60). This already supports keeping the original address and storing coordinates.
- Orders: do not store address; they reference the originating `Request` (orders/schemas/order.schema.ts). Location can be derived from the `Request`.

## Proposal
- Standardize storing both original address fields and coordinates across entities, and add geospatial querying support.

## Technical Plan
1. Schema Alignment
- Ensure Address sub-schema is the canonical place for formatted address + `latitude`/`longitude`.
- For Requests, prefer using the Address `latitude`/`longitude` and keep `location` as optional; or add a GeoJSON `locationPoint` to simplify queries.
- Optional (Orders): add `serviceLocation` (Address + `locationPoint`) if an order can change location versus the initial request.

2. Geospatial Indexes
- Add `2dsphere` index for fast proximity queries:
  - Requests: `locationPoint: { type: 'Point', coordinates: [lon, lat] }`, index `{ locationPoint: '2dsphere' }`.
  - Users: optional `addressPoint` for provider/customer addresses.

3. Geocoding Service
- Create `GeocodingService` with a pluggable provider (Nominatim by default; Google/Mapbox via env keys).
- Methods: `geocode(address) -> { lat, lon, fullAddress }`, `reverseGeocode(lat, lon) -> structured address`.
- Use in:
  - User profile updates (address changes)
  - Request creation/update (address provided)

4. Write Path Integration
- In relevant services (UsersService, RequestsService):
  - On address update/create: call geocoding; set `address.latitude`, `address.longitude`, `address.fullAddress`, and `locationPoint`.
  - Validate provider confidence; skip lat/lon if geocoding fails; log warning.

5. Read/Query APIs
- Add query endpoints using `$near`:
  - `GET /requests?near[lat]=..&near[lon]=..&maxDistance=..` to list nearby requests.
  - Optional: `GET /users/providers?near=..` for provider discovery.

6. Shared Types
- Extend `@darigo/shared-types` to include `Address { street, city, state, postalCode, country, latitude, longitude, fullAddress }` and optional `locationPoint` for entities that support geo queries.

7. Testing
- Unit tests for geocoding integration (mock provider) and schema updates.
- E2E tests for `$near` queries, verifying proximity filters.

## Acceptance Criteria
- When an address is saved, both original fields and lat/lon are stored.
- Nearby queries work via geospatial index.
- Orders derive location from Request unless explicitly overriden.

Confirm to proceed; I will implement the geocoding service, schema updates (GeoJSON point + indexes), service hooks on write, and proximity endpoints.