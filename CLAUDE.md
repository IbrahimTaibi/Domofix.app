# CLAUDE.md - Domofix.app Project Overview

> **Last Updated**: 2025-11-21
> **Purpose**: Comprehensive project documentation for AI assistants and developers

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Key Features](#key-features)
7. [Data Models](#data-models)
8. [API Reference](#api-reference)
9. [Development Workflow](#development-workflow)
10. [Code Patterns & Conventions](#code-patterns--conventions)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Domofix** is a modern two-sided marketplace platform connecting customers with service providers across multiple categories (plumbing, electrical, cleaning, tutoring, etc.).

### Core Value Proposition
- **For Customers**: Post service requests, receive provider applications, select the best match, track service execution
- **For Providers**: Discover requests, apply with proposals, manage services, build reputation through reviews

### Key Differentiators
- Real-time location-based matching with geospatial indexing
- Live chat widget powered by Socket.IO
- Provider verification system with document upload
- Multi-category support (10+ service types)
- Transparent pricing (fixed/hourly/range/negotiable)
- 5-star review system with image support

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.0.0
- npm 10.5.2+
- MongoDB 6.8+

### Installation
```bash
# Clone repository
git clone <repository-url>
cd domofix

# Install all dependencies (frontend, backend, packages)
npm run install:all

# Configure environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local
# Edit .env files with your configuration

# Start development servers (runs both frontend and backend)
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

### Default Credentials (Development)
Check the database seeds or create a new account through registration.

---

## 🏗️ Architecture

### Monorepo Structure
```
domofix/
├── apps/
│   ├── frontend/          # Next.js 14 (App Router) - Port 3000
│   └── backend/           # NestJS API - Port 3001
├── packages/
│   ├── shared-types/      # TypeScript type definitions
│   └── shared-utils/      # Shared utilities (bcrypt, validation)
├── docs/                  # Project documentation
├── turbo.json            # Turborepo build orchestration
└── package.json          # Workspace root
```

### Technology Paradigm
- **Build System**: Turborepo for monorepo management
- **Package Manager**: npm workspaces
- **Frontend**: Next.js 14 with App Router (React Server Components)
- **Backend**: NestJS (Node.js framework with Dependency Injection)
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT + NextAuth
- **State Management**: Zustand (lightweight alternative to Redux)

### Architecture Patterns
- **Frontend**: Feature-based architecture, Container/Presentational pattern
- **Backend**: Modular architecture, Service Layer pattern, Event-Driven Architecture
- **Database**: Document-oriented with embedded subdocuments and references
- **Communication**: REST APIs + WebSocket for real-time features

---

## 🛠️ Technology Stack

### Frontend (`apps/frontend`)
| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14.0, React 18.2 |
| **Styling** | Tailwind CSS 3.3.5, Custom design system |
| **State** | Zustand 4.4.6 |
| **Forms** | React Hook Form 7.66, Zod 3.22.4 |
| **Real-time** | Socket.IO Client 4.8.1 |
| **Auth** | NextAuth 4.24.13 |
| **Visualization** | Nivo charts (@nivo/*) 0.85 |
| **Animation** | Framer Motion 12.23 |
| **Icons** | Lucide React 0.292, React Icons 5.5 |
| **Date Handling** | date-fns 4.1, react-datepicker 8.8 |

### Backend (`apps/backend`)
| Category | Technologies |
|----------|-------------|
| **Framework** | NestJS 11.0 |
| **Runtime** | Node.js ≥18.0.0 |
| **Database** | MongoDB 6.8, Mongoose 8.19.2 |
| **Auth** | JWT, Passport (@nestjs/jwt, @nestjs/passport) |
| **Real-time** | Socket.IO 4.8.1, @nestjs/websockets |
| **Validation** | class-validator 0.14.2, class-transformer 0.5.1 |
| **Caching** | @nestjs/cache-manager 2.2.1 |
| **Rate Limiting** | @nestjs/throttler 6.2.0 |
| **Email** | Brevo (Sendinblue) API SDK 8.5.0 |
| **Events** | @nestjs/event-emitter 3.0.1 |

### Development Tools
- **TypeScript**: 5.3.2 / 5.7.3 (strict mode)
- **Testing**: Jest 30.0, React Testing Library 16.3, Supertest 7.0
- **Linting**: ESLint 9.18
- **Formatting**: Prettier 3.4.2

---

## 📁 Project Structure

### Frontend Structure (`apps/frontend`)
```
apps/frontend/
├── app/                          # Next.js App Router
│   ├── api/auth/                # NextAuth API routes
│   ├── dashboard/               # Provider dashboard pages
│   ├── auth/                    # Login, register pages
│   ├── register/                # Registration flows
│   ├── services/                # Service browsing
│   ├── profile/                 # User profiles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── error.tsx                # Error boundary
│   └── global-error.tsx         # Global error handler
│
├── features/                     # Feature-based modules
│   ├── auth/                    # Authentication
│   │   ├── components/          # Login, Register forms
│   │   ├── hooks/               # useAuth hook
│   │   ├── context/             # AuthProvider
│   │   ├── types/               # Auth types
│   │   └── utils/               # Validation schemas
│   ├── requests/                # Service requests
│   │   ├── components/          # Request forms, lists
│   │   ├── hooks/               # useRequestService
│   │   ├── services/            # API client
│   │   ├── store/               # Zustand store
│   │   └── types/               # Request types
│   ├── profile/                 # Profile management
│   ├── widget/                  # Chat widget (floating)
│   │   ├── components/          # Widget UI
│   │   ├── hooks/               # useWidgetSocket
│   │   ├── store/               # widgetStore, messagesStore
│   │   └── utils/               # Event bus
│   ├── notifications/           # Notifications
│   ├── providers/               # Provider features
│   └── dashboard/               # Dashboard features
│
├── shared/                       # Shared resources
│   ├── components/              # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── navbar.tsx
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   │   ├── useMobile.ts
│   │   ├── useDebounce.ts
│   │   └── ...
│   ├── store/                   # Global Zustand stores
│   ├── utils/                   # Utilities & API client
│   │   ├── api.ts               # Centralized API client
│   │   ├── error-tracking.ts
│   │   └── ...
│   └── types/                   # TypeScript types
│
├── public/                       # Static assets
├── tailwind.config.ts           # Tailwind configuration
├── next.config.js               # Next.js configuration
└── package.json
```

### Backend Structure (`apps/backend`)
```
apps/backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── guards/              # JwtAuthGuard, RolesGuard
│   │   ├── decorators/          # @Roles(), @CurrentUser()
│   │   └── strategies/          # JWT Strategy
│   │
│   ├── users/                   # User management
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── schemas/             # User schema
│   │
│   ├── requests/                # Service requests
│   │   ├── requests.controller.ts
│   │   ├── requests.service.ts
│   │   ├── requests.module.ts
│   │   └── schemas/             # Request schema
│   │
│   ├── orders/                  # Order management
│   ├── provider-services/       # Provider service listings
│   ├── provider-applications/   # Provider verification
│   ├── reviews/                 # Review & rating system
│   ├── messaging/               # Real-time messaging
│   │   ├── messaging.gateway.ts # Socket.IO gateway
│   │   ├── threads.service.ts
│   │   ├── messages.service.ts
│   │   └── schemas/
│   │
│   ├── notifications/           # Notification system
│   │   ├── notifications.gateway.ts
│   │   ├── notifications.service.ts
│   │   └── schemas/
│   │
│   ├── email/                   # Email service (Brevo)
│   │
│   ├── common/                  # Shared utilities
│   │   ├── filters/             # Exception filters
│   │   ├── interceptors/        # Request interceptors
│   │   ├── logging/             # Logger service
│   │   ├── monitoring/          # Monitoring service
│   │   ├── validators/          # Custom validators
│   │   └── errors/              # Custom error classes
│   │
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry point
│
├── test/                         # E2E tests
├── nest-cli.json                # NestJS CLI config
└── package.json
```

---

## ✨ Key Features

### For Customers

#### 1. **Service Request Creation**
- **Location**: `/app/request-service/page.tsx`
- **Flow**:
  1. Select service category (10 categories: plumber, electrician, cleaner, etc.)
  2. Provide location (address or GPS coordinates)
  3. Upload photos (optional)
  4. Set estimated time of service (ETS)
  5. Add service details
- **Backend**: `POST /requests` (`apps/backend/src/requests/`)

#### 2. **Provider Selection**
- **Location**: `/features/requests/components/`
- **Features**:
  - View provider applications with proposals
  - Compare pricing (fixed/hourly/range/negotiable)
  - Check provider ratings & reviews
  - Accept preferred provider
- **Backend**: `POST /requests/:id/accept`

#### 3. **Real-Time Chat**
- **Location**: `/features/widget/` (floating chat widget)
- **Features**:
  - Auto-opens when order accepted
  - Real-time messaging via Socket.IO
  - Message types: text, image, file
  - Read receipts
  - Unread message badges
- **Backend**: `apps/backend/src/messaging/messaging.gateway.ts`

#### 4. **Order Tracking**
- **Statuses**: assigned → in_progress → completed → canceled
- **Notifications**: Real-time updates via WebSocket

#### 5. **Review System**
- **Location**: `/features/reviews/`
- **Features**:
  - 5-star rating
  - Written review with images
  - Comment threads
- **Backend**: `apps/backend/src/reviews/`

### For Providers

#### 1. **Provider Application**
- **Location**: `/app/register/provider/page.tsx`
- **Flow**:
  1. Submit application
  2. Upload business documents (license, ID)
  3. Admin review (pending → approved/rejected/needs_info)
  4. Email notifications at each stage
- **Backend**: `apps/backend/src/provider-applications/`

#### 2. **Service Catalog Management**
- **Location**: `/app/dashboard/services/page.tsx`
- **Features**:
  - Create service listings
  - Set pricing (4 types: fixed, hourly, range, negotiable)
  - Upload service images
  - Manage availability (active/inactive/draft)
  - Track views & inquiries
- **Backend**: `apps/backend/src/provider-services/`

#### 3. **Request Discovery**
- **Location**: `/app/dashboard/requests/page.tsx`
- **Features**:
  - Browse open requests
  - Filter by category & location
  - View customer details
  - Apply with proposal (price, ETA, message)
- **Backend**: `GET /requests`, `POST /requests/:id/apply`

#### 4. **Provider Dashboard**
- **Location**: `/app/dashboard/`
- **Sections**:
  - **Overview**: Analytics, statistics
  - **Services**: Service catalog management
  - **Requests**: Browse & apply to requests
  - **Messages**: Chat with customers
  - **History**: Past orders
  - **Team**: Invite members, manage roles
  - **Settings**: Profile, subscriptions
  - **Invoices**: Payment history

### Cross-Cutting Features

#### 1. **Authentication**
- **Location**: `/features/auth/`
- **Methods**:
  - Email/Password (JWT-based)
  - OAuth (Facebook, Google, Twitter via NextAuth)
- **Features**:
  - Registration with email verification
  - Login with remember me
  - Password reset (forgot/reset flow)
  - Refresh token rotation
  - Two-factor authentication (planned)

#### 2. **Notifications**
- **Location**: `/features/notifications/`
- **Channels**:
  - In-app (notification center)
  - Email (Brevo/Sendinblue)
  - Real-time (WebSocket + SSE fallback)
  - Push notifications (planned)
- **Types**:
  - Request created/accepted/completed
  - Provider application status updates
  - System messages
  - Chat messages

#### 3. **Geolocation**
- **Frontend**: Browser Geolocation API
- **Backend**: MongoDB 2dsphere indexes for geospatial queries
- **Features**:
  - Location-based request matching
  - Distance calculations (planned)
  - Geocoding service integration

#### 4. **Role-Based Access Control**
- **Roles**: customer, provider, admin
- **Provider Status**: none → pending → approved/rejected
- **Guards**: `JwtAuthGuard`, `RolesGuard`
- **Decorators**: `@Roles('admin')`, `@Roles('provider')`

---

## 🗄️ Data Models

### User Schema
```typescript
User {
  _id: ObjectId
  email: string (unique, indexed)
  password: string (hashed with bcryptjs)
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  phoneNumber?: string (indexed)
  countryCode?: string

  // Phone verification
  phoneVerification: {
    verificationCode?: string
    verificationExpires?: Date
    verified: boolean
    attempts: number
  }

  // Address with geolocation
  address?: {
    street, city, state, postalCode, country: string
    latitude, longitude: number
    fullAddress: string
  }

  // Notification preferences
  notificationPreferences: {
    email, sms, push, marketing, security: boolean
  }

  // Security settings
  security: {
    twoFactorEnabled: boolean
    twoFactorSecret?: string
    failedLoginAttempts: number
    lockedUntil?: Date
    lastLoginAt?: Date
    lastLoginIP?: string
    trustedDevices: string[]
    passwordResetToken?: string (indexed)
    passwordResetExpires?: Date
    emailVerificationToken?: string (indexed)
    emailVerified: boolean
  }

  // Status & roles
  status: 'active' | 'inactive' | 'suspended' | 'pending' (indexed)
  role: 'customer' | 'provider' | 'admin' (indexed)
  providerStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'needs_info' (indexed)

  // Onboarding
  profileCompleted: boolean
  onboardingCompleted: boolean

  // Localization
  timezone: string
  locale: string

  createdAt: Date
  updatedAt: Date
}
```

**Key Indexes:**
- `email` (unique)
- `phoneNumber`
- `security.emailVerificationToken`
- `security.passwordResetToken`
- Compound: `(status, role, providerStatus)`

**Location**: `apps/backend/src/users/schemas/user.schema.ts`

---

### Request Schema
```typescript
Request {
  _id: ObjectId
  customerId: ObjectId (ref: User, indexed)

  // Location (multiple formats for compatibility)
  address?: {
    street, city, state, postalCode, country: string
    latitude, longitude: number
    fullAddress: string
  }
  location?: {
    latitude, longitude: number
    address, city, state, zipCode: string
  }
  locationPoint?: {  // GeoJSON for MongoDB geospatial queries
    type: 'Point'
    coordinates: [longitude, latitude]  // Note: [lng, lat] order
  }

  // Request details
  phone: string
  category: 'plumber' | 'barber' | 'cleaner' | 'tutor' | 'delivery' |
            'electrician' | 'carpenter' | 'painter' | 'gardener' | 'other' (indexed)
  estimatedTimeOfService: Date
  expiryNoticeSentAt?: Date
  details?: string
  photos: string[]

  // Status
  status: 'open' | 'pending' | 'accepted' | 'completed' | 'closed' (indexed)

  // Provider applications
  applications: [{
    providerId: ObjectId (ref: User, indexed)
    message?: string
    appliedAt: Date
    proposedEts?: Date
    proposedPrice?: number
    proposedPriceMin?: number
    proposedPriceMax?: number
  }]

  // Accepted provider
  acceptedProviderId?: ObjectId (ref: User, indexed)

  createdAt: Date
  updatedAt: Date
}
```

**Key Indexes:**
- Compound: `(customerId, status, createdAt)`
- Compound: `(status, createdAt)`
- `acceptedProviderId`
- `applications.providerId`
- Geospatial: `locationPoint` (2dsphere)

**Location**: `apps/backend/src/requests/schemas/request.schema.ts`

---

### Order Schema
```typescript
Order {
  _id: ObjectId
  requestId: ObjectId (ref: Request, indexed)
  customerId: ObjectId (ref: User, indexed)
  providerId: ObjectId (ref: User, indexed)

  status: 'assigned' | 'in_progress' | 'completed' | 'canceled' (indexed)

  acceptedAt: Date
  startedAt?: Date
  completedAt?: Date
  canceledAt?: Date
  providerEts?: Date

  createdAt: Date
  updatedAt: Date
}
```

**Key Indexes:**
- Compound: `(customerId, status, acceptedAt)`
- Compound: `(providerId, status, acceptedAt)`
- `requestId`

**Location**: `apps/backend/src/orders/schemas/order.schema.ts`

---

### ProviderService Schema
```typescript
ProviderService {
  _id: ObjectId
  providerId: ObjectId (ref: User, indexed)

  title: string (3-100 chars)
  description: string (10-2000 chars)
  category: string (indexed)

  // Pricing
  pricingType: 'fixed' | 'hourly' | 'range' | 'negotiable'
  basePrice?: number (min: 0)  // For fixed/hourly
  minPrice?: number (min: 0)   // For range
  maxPrice?: number (min: 0)   // For range

  tags: string[]
  images: string[]

  status: 'active' | 'inactive' | 'draft' (indexed)

  // Metrics
  viewCount: number (min: 0)
  inquiryCount: number (min: 0)

  metadata?: Record<string, any>

  createdAt: Date
  updatedAt: Date
}
```

**Virtuals:**
- `priceDisplay`: Formatted string based on pricingType
  - Fixed: "$50"
  - Hourly: "$50/hr"
  - Range: "$50-$100"
  - Negotiable: "Negotiable"

**Key Indexes:**
- Compound: `(providerId, status, createdAt)`
- Compound: `(category, status, createdAt)`
- Compound: `(providerId, category)`

**Location**: `apps/backend/src/provider-services/schemas/provider-service.schema.ts`

---

### Message & Thread Schemas
```typescript
Thread {
  _id: ObjectId
  orderId: ObjectId (ref: Order)
  participantIds: ObjectId[] (refs: User)
  status: 'active' | 'archived' | 'blocked'
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

Message {
  _id: ObjectId
  threadId: ObjectId (ref: Thread, indexed)
  senderId: ObjectId (ref: User, indexed)

  kind: 'text' | 'image' | 'file'
  text?: string
  imageUrl?: string
  fileMeta?: {
    name: string
    size: number
    mime: string
  }

  status: 'sent' | 'delivered' | 'read'

  createdAt: Date
  updatedAt: Date
}
```

**Key Indexes:**
- `(threadId, createdAt)`

**Location**: `apps/backend/src/messaging/schemas/`

---

### Review Schema
```typescript
Review {
  _id: ObjectId
  bookingId: ObjectId (unique)  // One review per booking
  customerId: ObjectId (indexed)
  providerId: ObjectId (indexed)
  serviceId: ObjectId (indexed)

  rating: number (1-5)
  comment?: string
  images?: string[]

  createdAt: Date
  updatedAt: Date
}
```

**Key Indexes:**
- `(providerId, createdAt)`
- `(serviceId, createdAt)`
- `(customerId, createdAt)`
- `bookingId` (unique)

**Location**: `apps/backend/src/reviews/schemas/review.schema.ts`

---

### Notification Schema
```typescript
Notification {
  _id: ObjectId
  userId: ObjectId (ref: User, indexed)

  title: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'

  type: 'request.created' | 'request.accepted' | 'request.completed' |
        'provider.application.created' | 'provider.application.updated' |
        'system.message' (indexed)

  data: Record<string, unknown>  // Flexible metadata
  readAt?: Date (indexed)

  createdAt: Date
  updatedAt: Date
}
```

**Key Indexes:**
- `(userId, createdAt)`
- `(userId, readAt)`

**Location**: `apps/backend/src/notifications/schemas/notification.schema.ts`

---

### Entity Relationships

```
User (customer) ───┬──< Request (customerId)
                   ├──< Order (customerId)
                   ├──< Review (customerId)
                   ├──< Notification (userId)
                   └──< Message (senderId)

User (provider) ───┬──< ProviderService (providerId)
                   ├──< ProviderApplication (userId)
                   ├──< Order (providerId)
                   ├──< Review (providerId)
                   └──< Request.applications[] (providerId)

Request ───────────< Order (requestId)
Order ─────────────┬──< Review (bookingId)
                   └──< Thread (orderId)
Thread ────────────< Message (threadId)
```

---

## 🔌 API Reference

### Base URLs
- **Development**: `http://localhost:3001`
- **Production**: TBD

### Authentication
All authenticated endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Common Response Formats

**Success Response**
```json
{
  "data": { /* resource object */ },
  "message": "Success message"
}
```

**Error Response**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "path": "/api/endpoint"
}
```

---

### Authentication Endpoints (`/auth`)

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"  // or "provider"
}

Response: 201 Created
{
  "data": {
    "user": { /* User object */ },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "data": {
    "user": { /* User object */ },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Get Current User Profile
```http
GET /auth/profile
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": { /* User object */ }
}
```

#### Refresh Access Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: 200 OK
{
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Password reset email sent"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}

Response: 200 OK
{
  "message": "Password reset successful"
}
```

#### Change Password
```http
PATCH /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

---

### Request Endpoints (`/requests`)

#### Create Service Request
```http
POST /requests
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "category": "plumber",
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001"
  },
  "estimatedTimeOfService": "2025-11-22T14:00:00Z",
  "details": "Leaking kitchen faucet needs repair",
  "photos": ["https://example.com/photo1.jpg"],
  "phone": "+1234567890"
}

Response: 201 Created
{
  "data": { /* Request object */ }
}
```

#### List Requests
```http
GET /requests?status=open&category=plumber&page=1&limit=10
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": [
    { /* Request object */ },
    { /* Request object */ }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Get Request Details
```http
GET /requests/:id
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": { /* Request object with populated applications */ }
}
```

#### Apply to Request (Provider)
```http
POST /requests/:id/apply
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "I have 10 years experience with plumbing...",
  "proposedEts": "2025-11-22T16:00:00Z",
  "proposedPrice": 150
}

Response: 201 Created
{
  "data": { /* Updated Request object */ }
}
```

#### Accept Provider (Customer)
```http
POST /requests/:id/accept
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "providerId": "60d5ec49f1b2c72b8c8e4f1a"
}

Response: 200 OK
{
  "data": {
    "request": { /* Updated Request object */ },
    "order": { /* New Order object */ }
  }
}
```

#### Complete Request
```http
PATCH /requests/:id/complete
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": { /* Updated Request object */ }
}
```

---

### Provider Service Endpoints (`/provider-services`)

#### Create Service Listing
```http
POST /provider-services
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Professional Plumbing Services",
  "description": "Licensed plumber with 15 years experience...",
  "category": "plumber",
  "pricingType": "hourly",
  "basePrice": 75,
  "tags": ["emergency", "licensed", "insured"],
  "images": ["https://example.com/service1.jpg"],
  "status": "active"
}

Response: 201 Created
{
  "data": { /* ProviderService object */ }
}
```

#### List Services
```http
GET /provider-services?category=plumber&status=active&page=1&limit=10

Response: 200 OK
{
  "data": [
    { /* ProviderService object */ },
    { /* ProviderService object */ }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Update Service
```http
PATCH /provider-services/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "basePrice": 80,
  "status": "inactive"
}

Response: 200 OK
{
  "data": { /* Updated ProviderService object */ }
}
```

#### Delete Service
```http
DELETE /provider-services/:id
Authorization: Bearer <access_token>

Response: 204 No Content
```

---

### Messaging Endpoints (`/threads`, `/messages`)

#### List Threads
```http
GET /threads?status=active&page=1&limit=20
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": [
    { /* Thread object with last message */ }
  ]
}
```

#### Get Thread Messages
```http
GET /threads/:threadId/messages?page=1&limit=50
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": [
    { /* Message object */ }
  ]
}
```

#### Send Message
```http
POST /threads/:threadId/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "kind": "text",
  "text": "Hello, I'll arrive at 2pm"
}

Response: 201 Created
{
  "data": { /* Message object */ }
}
```

#### Mark Messages as Read
```http
POST /threads/:threadId/read
Authorization: Bearer <access_token>

Response: 200 OK
{
  "message": "Messages marked as read"
}
```

---

### WebSocket Events

#### Connection
```javascript
// Client connects with JWT token
const socket = io('http://localhost:3001', {
  auth: { token: accessToken }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

#### Messaging Events
```javascript
// Join thread
socket.emit('thread:join', { threadId: '60d5ec49f1b2c72b8c8e4f1a' });

// Leave thread
socket.emit('thread:leave', { threadId: '60d5ec49f1b2c72b8c8e4f1a' });

// Listen for new messages
socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Listen for read receipts
socket.on('message:read', ({ messageId, readAt }) => {
  console.log('Message read:', messageId);
});
```

#### Notification Events
```javascript
// Listen for new notifications
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

---

### Notification Endpoints (`/notifications`)

#### List Notifications
```http
GET /notifications?page=1&limit=20&unreadOnly=true
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": [
    { /* Notification object */ }
  ],
  "meta": {
    "total": 15,
    "unreadCount": 5
  }
}
```

#### Mark as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer <access_token>

Response: 200 OK
{
  "data": { /* Updated Notification object */ }
}
```

#### Server-Sent Events Stream
```javascript
// Subscribe to SSE notifications
const eventSource = new EventSource(
  'http://localhost:3001/notifications/stream',
  { headers: { Authorization: `Bearer ${accessToken}` } }
);

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};
```

---

## 🔧 Development Workflow

### Environment Setup

#### Backend Environment Variables
Create `apps/backend/.env`:
```env
# Environment
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/domofix

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_ACCESS_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3002

# Email (Brevo/Sendinblue)
BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM=Domofix <noreply@domofix.com>
APP_URL=http://localhost:3000
```

#### Frontend Environment Variables
Create `apps/frontend/.env.local`:
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

# OAuth Providers (optional)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
```

---

### Running the Application

#### All Services
```bash
# Development mode (both frontend and backend)
npm run dev

# Production build
npm run build
npm run start
```

#### Individual Services
```bash
# Frontend only
cd apps/frontend
npm run dev        # Development (localhost:3000)
npm run build      # Production build
npm run start      # Start production server

# Backend only
cd apps/backend
npm run start:dev  # Development (localhost:3001)
npm run build      # Production build
npm run start:prod # Start production server
```

---

### Database Management

#### MongoDB Setup
```bash
# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongosh mongodb://localhost:27017/domofix
```

#### Database Seeding
```bash
cd apps/backend

# Seed database with sample data
npm run seed

# Reset database and reseed
npm run seed:reset
```

---

### Common Development Commands

#### Root Level (`package.json`)
```bash
npm run dev                # Start all services
npm run dev:frontend       # Frontend only
npm run dev:backend        # Backend only

npm run build              # Build all
npm run build:frontend     # Build frontend
npm run build:backend      # Build backend

npm run test               # Run all tests
npm run test:frontend      # Frontend tests
npm run test:backend       # Backend tests

npm run lint               # Lint all code
npm run type-check         # TypeScript validation
npm run clean              # Clean build artifacts
```

#### Frontend Commands
```bash
cd apps/frontend

npm run dev                # Dev server (localhost:3000)
npm run build              # Production build
npm run start              # Start production server
npm run test               # Run Jest tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npm run lint               # ESLint
npm run type-check         # TypeScript validation
```

#### Backend Commands
```bash
cd apps/backend

npm run start:dev          # Dev server with hot reload (localhost:3001)
npm run build              # Build for production
npm run start:prod         # Start production server
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Coverage report
npm run lint               # ESLint
npm run format             # Prettier
npm run seed               # Seed database
npm run seed:reset         # Reset and reseed
```

---

### Git Workflow

#### Branch Naming Conventions
```
feature/amazing-feature    # New features
bugfix/fix-login-issue     # Bug fixes
hotfix/critical-security   # Critical fixes
refactor/improve-auth      # Code refactoring
docs/update-readme         # Documentation
test/add-unit-tests        # Test additions
```

#### Commit Message Format (Conventional Commits)
```
feat: add chat widget to dashboard
fix: resolve authentication token refresh bug
docs: update API documentation for requests endpoint
refactor: improve error handling in messaging service
test: add unit tests for auth service
chore: update dependencies
```

#### Typical Workflow
```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "feat: add amazing feature"

# Push to remote
git push -u origin feature/amazing-feature

# Create pull request on GitHub
```

---

## 📐 Code Patterns & Conventions

### Frontend Patterns

#### 1. Feature-Based Architecture
Each feature is self-contained with its own components, hooks, services, and store.

```
features/
└── auth/
    ├── components/          # UI components
    │   ├── LoginForm.tsx
    │   └── RegisterForm.tsx
    ├── hooks/              # Custom hooks
    │   └── useAuth.ts
    ├── services/           # API calls
    │   └── authService.ts
    ├── store/              # Zustand store
    │   └── authStore.ts
    ├── types/              # TypeScript types
    │   └── index.ts
    └── index.ts           # Public exports
```

#### 2. Component Structure
```typescript
// Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'rounded-lg font-medium transition-colors',
          {
            'bg-primary-500 text-white hover:bg-primary-600': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'border border-gray-300 hover:bg-gray-50': variant === 'outline',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
            'opacity-50 cursor-not-allowed': loading,
          }
        )}
        disabled={loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### 3. Custom Hook Pattern
```typescript
// useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// Usage
function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 4. API Client Pattern
```typescript
// api.ts
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor (handle errors)
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        if (error.response?.status === 401) {
          // Refresh token logic
          await this.refreshToken();
          return this.client.request(error.config);
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data);
  }

  // ... other methods
}

export const api = new ApiClient();
```

#### 5. Zustand Store Pattern
```typescript
// widgetStore.ts
import { create } from 'zustand';

interface WidgetState {
  isOpen: boolean;
  activeTab: 'home' | 'messages' | 'help';
  currentOrderId: string | null;
  unreadCount: number;

  // Actions
  openWidget: () => void;
  closeWidget: () => void;
  setActiveTab: (tab: string) => void;
  setCurrentOrder: (orderId: string) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  isOpen: false,
  activeTab: 'home',
  currentOrderId: null,
  unreadCount: 0,

  openWidget: () => set({ isOpen: true }),
  closeWidget: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCurrentOrder: (orderId) => set({ currentOrderId: orderId }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
```

---

### Backend Patterns

#### 1. Module Structure (NestJS)
```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

#### 2. Controller Pattern
```typescript
// auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
```

#### 3. Service Layer Pattern
```typescript
// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return { user, ...tokens };
  }

  private async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId }, { expiresIn: '24h' }),
      this.jwtService.signAsync({ sub: userId }, { expiresIn: '30d' }),
    ]);

    return { accessToken, refreshToken };
  }
}
```

#### 4. DTO Pattern with Validation
```typescript
// create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
} from 'class-validator';

enum UserRole {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number/special char',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
```

#### 5. Schema Definition (Mongoose)
```typescript
// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ enum: ['customer', 'provider', 'admin'], default: 'customer' })
  role: string;

  @Prop({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status: string;

  @Prop({ type: Object })
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
```

#### 6. Guard Pattern
```typescript
// jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user.role === role);
  }
}

// Usage
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/users')
async getUsers() {
  return this.usersService.findAll();
}
```

#### 7. Exception Filter Pattern
```typescript
// global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

#### 8. WebSocket Gateway Pattern
```typescript
// messaging.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('thread:join')
  async handleJoinThread(client: Socket, payload: { threadId: string }) {
    client.join(payload.threadId);
    console.log(`Client ${client.id} joined thread ${payload.threadId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('thread:leave')
  async handleLeaveThread(client: Socket, payload: { threadId: string }) {
    client.leave(payload.threadId);
    console.log(`Client ${client.id} left thread ${payload.threadId}`);
  }

  // Emit new message to thread participants
  emitNewMessage(threadId: string, message: any) {
    this.server.to(threadId).emit('message:new', message);
  }
}
```

---

### Naming Conventions

#### Files & Directories
- **Components/Classes**: PascalCase (`UserProfile.tsx`, `AuthService.ts`)
- **Functions/Variables**: camelCase (`getUserById`, `isAuthenticated`)
- **Files (general)**: kebab-case (`user-profile.tsx`, `auth.service.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`User`, `CreateUserDto`)

#### Code Examples
```typescript
// ✅ Good
const getUserProfile = async (userId: string): Promise<User> => {
  // ...
};

const API_TIMEOUT = 5000;

interface UserProfile {
  id: string;
  name: string;
}

// ❌ Bad
const GetUserProfile = async (userId: string) => { /* ... */ };
const api_timeout = 5000;
interface userProfile { /* ... */ }
```

---

### Error Handling

#### Frontend Error Handling
```typescript
// error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { ErrorView } from '@/shared/components/ErrorView';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView error={this.state.error} />;
    }

    return this.props.children;
  }
}

// API error handling
try {
  const user = await api.get<User>('/users/me');
} catch (error) {
  if (error.response?.status === 404) {
    // Handle not found
  } else if (error.response?.status === 401) {
    // Handle unauthorized
  } else {
    // Generic error
    toast.error('An error occurred');
  }
}
```

#### Backend Error Handling
```typescript
// custom-errors.ts
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// Usage in service
async findUserById(id: string): Promise<User> {
  const user = await this.userModel.findById(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

// Controller handles errors automatically via global filter
@Get(':id')
async getUser(@Param('id') id: string) {
  return this.usersService.findUserById(id);
}
```

---

## 🧪 Testing Strategy

### Test Coverage Requirements
- **Global**: 80% (branches, functions, lines, statements)
- **Components**: 90% (critical UI components)
- **Services**: 85% (business logic)
- **Utils**: 95% (pure functions)

### Testing Pyramid
```
     /\
    /  \    E2E Tests (10%)
   /    \   - Critical user flows
  /------\  - Full stack integration
 /        \
/----------\ Integration Tests (20%)
            - API endpoints
            - Database operations
            - Module interactions

───────────── Unit Tests (70%)
              - Components
              - Hooks
              - Services
              - Utils
```

---

### Frontend Testing

#### Component Testing (React Testing Library)
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-500');

    rerender(<Button variant="secondary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });
});
```

#### Hook Testing
```typescript
// useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from './AuthProvider';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth', () => {
  it('returns user when authenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

#### API Mocking (MSW)
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          user: { id: '1', email: 'user@example.com', role: 'customer' },
          accessToken: 'mock-token',
        },
      })
    );
  }),

  rest.get('/requests', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          { id: '1', category: 'plumber', status: 'open' },
          { id: '2', category: 'electrician', status: 'open' },
        ],
      })
    );
  }),
];

// setupTests.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

### Backend Testing

#### Unit Testing (Services)
```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return user and tokens on successful login', async () => {
      const mockUser = { id: '1', email: 'user@example.com', password: 'hashed' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-token');

      const result = await service.login({
        email: 'user@example.com',
        password: 'password',
      });

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({ email: 'invalid@example.com', password: 'wrong' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

#### Integration Testing (E2E)
```typescript
// auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('MONGODB_URI')
      .useValue(mongoUri)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.user).toBeDefined();
          expect(res.body.data.accessToken).toBeDefined();
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login existing user', async () => {
      // First register
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'loginuser@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
        });

      // Then login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'SecurePass123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.user.email).toBe('loginuser@example.com');
          expect(res.body.data.accessToken).toBeDefined();
        });
    });
  });
});
```

---

### Running Tests

#### Frontend Tests
```bash
cd apps/frontend

# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm run test -- Button.test.tsx

# Run tests matching pattern
npm run test -- --testNamePattern="should render"
```

#### Backend Tests
```bash
cd apps/backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov

# Watch mode
npm run test:watch

# Debug mode
npm run test:debug
```

---

## 🚀 Deployment

### Production Build

#### Frontend Build
```bash
cd apps/frontend

# Build for production
npm run build

# Start production server
npm run start

# Or build all from root
npm run build:frontend
```

#### Backend Build
```bash
cd apps/backend

# Build TypeScript to JavaScript
npm run build

# Start production server
npm run start:prod

# Or build all from root
npm run build:backend
```

---

### Environment Variables for Production

#### Backend Production `.env`
```env
NODE_ENV=production
PORT=3001

# Database (use managed MongoDB like Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/domofix?retryWrites=true&w=majority

# JWT Secrets (use strong random strings)
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_ACCESS_SECRET=your-production-access-secret
JWT_ACCESS_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-production-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS (production frontend URLs)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (Brevo)
BREVO_API_KEY=your-production-brevo-api-key
EMAIL_FROM=Domofix <noreply@yourdomain.com>
APP_URL=https://yourdomain.com
```

#### Frontend Production `.env.production`
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-nextauth-secret

# OAuth (production credentials)
FACEBOOK_CLIENT_ID=your-production-facebook-id
FACEBOOK_CLIENT_SECRET=your-production-facebook-secret
GOOGLE_CLIENT_ID=your-production-google-id
GOOGLE_CLIENT_SECRET=your-production-google-secret

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
```

---

### Deployment Options

#### Option 1: Vercel (Frontend) + DigitalOcean/Railway (Backend)

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd apps/frontend
vercel --prod

# Configure environment variables in Vercel dashboard
```

**Backend on Railway:**
1. Create account at https://railway.app
2. Create new project
3. Connect GitHub repository
4. Configure build command: `cd apps/backend && npm install && npm run build`
5. Configure start command: `cd apps/backend && npm run start:prod`
6. Add environment variables
7. Deploy

#### Option 2: Docker (Full Stack)

**Dockerfile (Backend)**
```dockerfile
# apps/backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm ci

# Copy source
COPY apps/backend ./apps/backend
COPY packages ./packages

# Build
RUN npm run build:backend

# Production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main"]
```

**Dockerfile (Frontend)**
```dockerfile
# apps/frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm ci

COPY apps/frontend ./apps/frontend
COPY packages ./packages

RUN npm run build:frontend

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.8
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/domofix?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGINS: http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      - backend

volumes:
  mongo-data:
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **MongoDB Connection Errors**

**Problem**: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions**:
```bash
# Check if MongoDB is running
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/domofix
```

---

#### 2. **JWT Token Errors**

**Problem**: `JsonWebTokenError: invalid signature`

**Solutions**:
- Ensure `JWT_SECRET` matches between token generation and validation
- Check `.env` files are loaded correctly
- Verify no extra spaces in environment variables
```bash
# Generate strong secret
openssl rand -base64 32
```

---

#### 3. **CORS Errors**

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:
```typescript
// Backend: apps/backend/src/main.ts
app.enableCors({
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
});

// Check .env
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
```

---

#### 4. **Socket.IO Connection Issues**

**Problem**: WebSocket connection fails

**Solutions**:
```typescript
// Frontend: Ensure correct URL and auth
const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: { token: accessToken },
  transports: ['websocket', 'polling'],  // Add fallback
});

// Backend: Check CORS for Socket.IO
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS.split(','),
    credentials: true,
  },
})
```

---

#### 5. **Build Errors (TypeScript)**

**Problem**: `Cannot find module '@domofix/shared-types'`

**Solutions**:
```bash
# Rebuild shared packages
npm run build

# Or specifically
cd packages/shared-types
npm run build

# Clear cache
npm run clean
rm -rf node_modules
npm install
```

---

#### 6. **Next.js Image Optimization Errors**

**Problem**: `Invalid src prop on next/image`

**Solutions**:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: [
      'localhost',
      'cloudinary.com',
      's3.amazonaws.com',
      'i.pravatar.cc',
    ],
  },
};
```

---

#### 7. **Port Already in Use**

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3002 npm run dev
```

---

### Debug Mode

#### Frontend Debug
```bash
# Enable verbose logging
DEBUG=* npm run dev

# React DevTools (browser extension)
# - Install from Chrome/Firefox store
# - Inspect component tree and props
```

#### Backend Debug
```bash
# Debug mode with breakpoints
npm run start:debug

# Then attach debugger (VS Code)
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "attach",
  "name": "Attach to NestJS",
  "port": 9229,
  "restart": true
}
```

---

### Logging

#### Frontend Logging
```typescript
// shared/utils/logger.ts
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  },
};

// Usage
logger.info('User logged in', { userId: user.id });
logger.error('Failed to fetch requests', error);
```

#### Backend Logging
```typescript
// Use NestJS Logger
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(dto: LoginDto) {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    try {
      // ... login logic
      this.logger.log(`User logged in successfully: ${user.id}`);
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

---

## 📚 Additional Resources

### Documentation
- **Project Docs**: `/docs` directory
- **API Docs**: (OpenAPI/Swagger - planned)
- **Architecture Diagrams**: `/docs/architecture`

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Socket.IO Documentation](https://socket.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Contributing

### Git Workflow
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m "feat: add amazing feature"`
3. Push to remote: `git push origin feature/amazing-feature`
4. Create Pull Request on GitHub

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests added/updated
- [ ] TypeScript types are correct
- [ ] No console.logs (use logger)
- [ ] Documentation updated
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)

---

## 📊 Project Statistics

- **Total Lines of Code**: ~5,487 (TypeScript/TSX)
- **Backend Modules**: 14 core modules
- **Frontend Features**: 13+ feature modules
- **Database Collections**: 11 schemas
- **API Endpoints**: 40+ REST endpoints
- **WebSocket Events**: 10+ real-time events
- **Service Categories**: 10 categories
- **Test Coverage Target**: 80%

---

## 🎯 Roadmap & Future Enhancements

### Short-term (Next 3 months)
- [ ] Complete test coverage (80% target)
- [ ] Add E2E tests with Playwright
- [ ] Implement OpenAPI/Swagger documentation
- [ ] Add payment integration (Stripe)
- [ ] Enhance customer dashboard

### Medium-term (3-6 months)
- [ ] Mobile apps (React Native)
- [ ] Advanced geospatial search with distance filters
- [ ] Real-time location tracking for providers
- [ ] Multi-language support (i18n)
- [ ] Performance monitoring (Datadog/New Relic)

### Long-term (6+ months)
- [ ] Machine learning for provider matching
- [ ] Video consultations
- [ ] Subscription plans for providers
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations

---

## 📝 Notes for AI Assistants

### Key Context Points
1. **Monorepo**: All packages must be installed from root with `npm install`
2. **TypeScript**: Strict mode enabled, no `any` types
3. **Authentication**: JWT-based with refresh tokens
4. **Real-time**: Socket.IO for chat and notifications
5. **Database**: MongoDB with Mongoose ODM
6. **State Management**: Zustand (not Redux)
7. **Testing**: Jest + React Testing Library + Supertest

### Common Commands Reference
```bash
# Start development
npm run dev

# Run tests
npm run test

# Build production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### File Locations Reference
- **Auth Logic**: `apps/backend/src/auth/`, `apps/frontend/features/auth/`
- **Requests**: `apps/backend/src/requests/`, `apps/frontend/features/requests/`
- **Chat Widget**: `apps/frontend/features/widget/`
- **API Client**: `apps/frontend/shared/utils/api.ts`
- **User Schema**: `apps/backend/src/users/schemas/user.schema.ts`
- **WebSocket**: `apps/backend/src/messaging/messaging.gateway.ts`

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
**Maintained by**: Domofix Team

For questions or issues, please create an issue on GitHub or contact the development team.
- always respect the architecture , write clean code , respect the overall design and ui , and always respect best Ui/UX
- always modularized , maintainable scalable code.