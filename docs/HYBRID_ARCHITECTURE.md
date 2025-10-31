# Hybrid Architecture: Next.js + NestJS

## Overview

This project uses a hybrid architecture combining Next.js API routes for standard operations and NestJS for real-time features.

## Service Boundaries

### Next.js API Routes (Port 3000)
**Purpose:** Handle standard HTTP operations, authentication, and CRUD operations

#### Endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

- `GET /api/services` - List services
- `POST /api/services` - Create service (providers)
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review

### NestJS Real-time Service (Port 4000)
**Purpose:** Handle real-time features, WebSocket connections, and live updates

#### WebSocket Events:
- `booking:status-changed` - Real-time booking status updates
- `booking:new` - New booking notifications for providers
- `chat:message` - Live chat messages
- `location:update` - Live location tracking
- `availability:changed` - Provider availability updates
- `notification:new` - General notifications

#### HTTP Endpoints:
- `GET /realtime/health` - Service health check
- `POST /realtime/notifications` - Send notifications
- `GET /realtime/chat/:bookingId` - Get chat history

## Communication Flow

```
Frontend (Next.js)
    ↓
Next.js API Routes ← → Database
    ↓
NestJS Service (WebSocket)
    ↓
Real-time Updates
```

## When to Use Each Service

### Use Next.js API Routes When:
- Standard CRUD operations
- Authentication flows
- File uploads
- Data that doesn't need real-time updates
- SEO-friendly pages

### Use NestJS Service When:
- Real-time status updates needed
- Live chat functionality
- Push notifications
- Live location tracking
- Event-driven architecture needed

## Implementation Phases

### Phase 1: Next.js Only (Current)
- Basic authentication
- Service listings
- Static bookings
- Reviews system

### Phase 2: Add NestJS for Real-time
- WebSocket gateway
- Real-time booking updates
- Live notifications
- Chat system

### Phase 3: Advanced Features
- Live location tracking
- Advanced notifications
- Real-time analytics
- Microservices scaling

## Shared Resources

### Database
Both services can share the same database with proper connection pooling.

### Types/Interfaces
Shared TypeScript types should be maintained in a common package or duplicated with sync.

### Authentication
Next.js handles authentication, NestJS validates JWT tokens for WebSocket connections.

## Development Setup

### Running Both Services:
```bash
# Terminal 1: Next.js (Frontend + API)
npm run dev

# Terminal 2: NestJS (Real-time service)
cd nestjs-realtime
npm run start:dev
```

### Environment Variables:
```env
# Next.js
NEXTAUTH_SECRET=your-secret
DATABASE_URL=your-db-url

# NestJS
REALTIME_PORT=4000
JWT_SECRET=same-as-nextjs
DATABASE_URL=same-as-nextjs
```

## Benefits of This Approach

1. **Start Simple** - Begin with Next.js API routes
2. **Scale Gradually** - Add NestJS when real-time features are needed
3. **Independent Deployment** - Deploy services separately
4. **Technology Fit** - Use the right tool for each job
5. **Cost Effective** - Only run complex services when needed
6. **Team Flexibility** - Different teams can work on different services