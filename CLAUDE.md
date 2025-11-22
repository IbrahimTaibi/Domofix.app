# CLAUDE.md - Domofix Project Guide

> **Last Updated**: 2025-11-22
> **Purpose**: Essential project documentation for AI assistants

---

## Project Overview

**Domofix** is a two-sided marketplace connecting customers with service providers.

- **Customers**: Post requests, receive applications, select providers
- **Providers**: Browse requests, apply with proposals, manage services
- **Features**: Real-time chat (Socket.IO), geolocation matching, reviews, notifications

---

## Quick Start

```bash
# Install & run
npm install
npm run dev

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Environment Files
- Backend: `apps/backend/.env`
- Frontend: `apps/frontend/.env.local`

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router), React 18.2
- **Styling**: Tailwind CSS 3.3.5
- **State**: Zustand 4.4.6
- **Forms**: React Hook Form 7.66, Zod 3.22.4
- **Real-time**: Socket.IO Client 4.8.1
- **Auth**: NextAuth 4.24.13

### Backend
- **Framework**: NestJS 11.0
- **Database**: MongoDB 6.8, Mongoose 8.19.2
- **Auth**: JWT, Passport
- **Real-time**: Socket.IO 4.8.1
- **Email**: Brevo API 8.5.0
- **Validation**: class-validator 0.14.2

---

## Architecture

```
domofix/
├── apps/
│   ├── frontend/         # Next.js (Port 3000)
│   │   ├── app/         # Next.js App Router pages
│   │   ├── features/    # Feature modules (auth, requests, widget, etc.)
│   │   └── shared/      # Shared components, hooks, utils
│   │
│   └── backend/         # NestJS API (Port 3001)
│       └── src/
│           ├── auth/           # Authentication
│           ├── users/          # User management
│           ├── requests/       # Service requests
│           ├── orders/         # Order management
│           ├── provider-services/  # Service catalog
│           ├── messaging/      # Real-time chat
│           └── notifications/  # Notifications
│
└── packages/
    ├── shared-types/    # TypeScript types
    └── shared-utils/    # Shared utilities
```

---

## Core Data Models

### User
```typescript
User {
  email, password, firstName, lastName, avatar, bio
  phoneNumber, address { street, city, latitude, longitude }
  role: 'customer' | 'provider' | 'admin'
  providerStatus: 'none' | 'pending' | 'approved' | 'rejected'
  status: 'active' | 'inactive' | 'suspended'
}
// Location: apps/backend/src/users/schemas/user.schema.ts
```

### Request
```typescript
Request {
  customerId, category, location, phone
  estimatedTimeOfService, details, photos
  status: 'open' | 'pending' | 'accepted' | 'completed' | 'closed'
  applications: [{ providerId, message, proposedPrice, ... }]
  acceptedProviderId
}
// Location: apps/backend/src/requests/schemas/request.schema.ts
```

### Order
```typescript
Order {
  requestId, customerId, providerId
  status: 'assigned' | 'in_progress' | 'completed' | 'canceled'
  acceptedAt, startedAt, completedAt
}
// Location: apps/backend/src/orders/schemas/order.schema.ts
```

### ProviderService
```typescript
ProviderService {
  providerId, title, description, category
  pricingType: 'fixed' | 'hourly' | 'range' | 'negotiable'
  basePrice, minPrice, maxPrice
  status: 'active' | 'inactive' | 'draft'
}
// Location: apps/backend/src/provider-services/schemas/provider-service.schema.ts
```

---

## Key API Endpoints

### Auth (`/auth`)
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /auth/profile` - Get current user (requires JWT)
- `POST /auth/refresh` - Refresh token

### Requests (`/requests`)
- `POST /requests` - Create request (customer)
- `GET /requests` - List requests (with filters)
- `POST /requests/:id/apply` - Apply to request (provider)
- `POST /requests/:id/accept` - Accept provider (customer)

### Provider Services (`/provider-services`)
- `POST /provider-services` - Create service
- `GET /provider-services` - List services
- `PATCH /provider-services/:id` - Update service

### Messaging (`/threads`, `/messages`)
- `GET /threads` - List message threads
- `GET /threads/:id/messages` - Get thread messages
- `POST /threads/:id/messages` - Send message

### WebSocket Events
- `thread:join` / `thread:leave` - Join/leave chat
- `message:new` - New message received
- `notification:new` - New notification

---

## Common Commands

```bash
# Development
npm run dev                 # All services
npm run dev:frontend        # Frontend only
npm run dev:backend         # Backend only

# Build
npm run build
npm run build:frontend
npm run build:backend

# Testing
npm run test
npm run test:frontend
npm run test:backend

# Other
npm run lint
npm run type-check
```

---

## Code Conventions

### Naming
- **Components/Classes**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserById`)
- **Files**: kebab-case (`user-profile.tsx`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Patterns
- **Frontend**: Feature-based architecture, Zustand for state
- **Backend**: NestJS modules, Service Layer pattern
- **TypeScript**: Strict mode, no `any` types

### File Structure
```
features/auth/
├── components/    # UI components
├── hooks/         # Custom hooks
├── services/      # API calls
├── store/         # Zustand store
└── types/         # TypeScript types
```

---

## Key Locations

| Feature | Frontend | Backend |
|---------|----------|---------|
| Auth | `features/auth/` | `src/auth/` |
| Requests | `features/requests/` | `src/requests/` |
| Chat Widget | `features/widget/` | `src/messaging/messaging.gateway.ts` |
| API Client | `shared/utils/api.ts` | - |
| User Schema | - | `src/users/schemas/user.schema.ts` |

---

## Important Notes

1. **Monorepo**: Install from root with `npm install`
2. **Authentication**: JWT-based with refresh tokens
3. **Real-time**: Socket.IO for chat and notifications
4. **Database**: MongoDB with Mongoose ODM
5. **State Management**: Zustand (not Redux)
6. **Code Quality**: Clean, modular, scalable code following best practices
7. **UI/UX**: Respect overall design and maintain consistency

---

**Version**: 2.0.0 (Minimal)
**Maintained by**: Domofix Team
