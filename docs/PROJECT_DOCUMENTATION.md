# Darigo Project Documentation
## Comprehensive Architecture & Roadmap

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Current Project Structure](#current-project-structure)
3. [Technology Stack](#technology-stack)
4. [Current Implementation Status](#current-implementation-status)
5. [Future Architecture Roadmap](#future-architecture-roadmap)
6. [Scalability & Performance](#scalability--performance)
7. [Security Implementation](#security-implementation)
8. [Development Guidelines](#development-guidelines)

---

## Project Overview

**Darigo** is a hyperlocal services platform that connects customers with local service providers. Built with modern web technologies, it features a responsive design, real-time capabilities, and a scalable architecture designed for growth.

### Core Features
- **User Authentication & Profiles**: Secure login/registration for customers and providers
- **Service Discovery**: Location-based service search and filtering
- **Booking Management**: Real-time booking system with status tracking
- **Provider Dashboard**: Tools for service providers to manage their offerings
- **Review System**: Customer feedback and rating system
- **Real-time Communication**: Live chat and notifications

---

## Current Project Structure

### Root Directory Layout
```
C:\Users\1\Darigo/
├── 📁 app/                          # Next.js 14 App Router
│   ├── 📁 (auth)/                   # Authentication route group
│   ├── 📁 api/                      # API routes (REST endpoints)
│   │   ├── auth/                    # Authentication endpoints
│   │   ├── health/                  # Health check endpoints
│   │   └── profile/                 # User profile management
│   ├── 📁 get-started/              # Onboarding pages
│   ├── 📁 login/                    # Login page
│   ├── 📁 profile/                  # User profile pages
│   ├── 📁 register/                 # Registration pages
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout component
│   └── page.tsx                     # Home page
│
├── 📁 components/                   # React components library
│   ├── 📁 auth/                     # Authentication components
│   │   ├── customer-registration-form.tsx
│   │   ├── login-form.tsx
│   │   ├── mock-users-info.tsx
│   │   └── provider-registration-form.tsx
│   ├── 📁 features/                 # Feature-specific components
│   │   └── search-preview.tsx
│   ├── 📁 get-started/              # Onboarding components
│   ├── 📁 layout/                   # Layout components
│   │   ├── footer.tsx
│   │   ├── logo.tsx
│   │   ├── nav-links.tsx
│   │   └── navbar.tsx
│   ├── 📁 profile/                  # Profile management components
│   │   ├── account-settings.tsx
│   │   ├── change-password-modal.tsx
│   │   ├── edit-profile-form.tsx
│   │   ├── notification-settings.tsx
│   │   ├── privacy-settings.tsx
│   │   ├── profile-header.tsx
│   │   ├── profile-info.tsx
│   │   ├── profile-picture-upload.tsx
│   │   └── profile-skeleton.tsx
│   ├── 📁 sections/                 # Landing page sections
│   └── 📁 ui/                       # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       └── textarea.tsx
│
├── 📁 hooks/                        # Custom React hooks
│   ├── use-auth.ts                  # Authentication hook
│   ├── use-debounce.ts              # Debounce utility hook
│   ├── use-fetch.ts                 # Data fetching hook
│   ├── use-form.ts                  # Form management hook
│   ├── use-local-storage.ts         # Local storage hook
│   ├── use-location.ts              # Geolocation hook
│   ├── use-mobile.ts                # Mobile detection hook
│   ├── use-multi-step-form.ts       # Multi-step form hook
│   └── use-validation.ts            # Validation hook
│
├── 📁 lib/                          # Utility libraries & helpers
│   ├── 📁 __tests__/                # Test files
│   │   ├── api/                     # API tests
│   │   ├── components/              # Component tests
│   │   ├── hooks/                   # Hook tests
│   │   └── utils/                   # Utility tests
│   ├── 📁 api/                      # API client utilities
│   │   └── client.ts
│   ├── 📁 mock-data/                # Mock data for development
│   │   └── users.ts
│   ├── 📁 models/                   # Database models
│   │   └── User.ts
│   ├── 📁 utils/                    # Utility functions
│   │   ├── dom.ts
│   │   ├── formatting.ts
│   │   └── styles.ts
│   ├── constants.ts                 # Application constants
│   ├── fonts.ts                     # Font configurations
│   ├── jwt.ts                       # JWT utilities
│   ├── mongodb.ts                   # Database connection
│   ├── theme.ts                     # Theme configuration
│   ├── utils.ts                     # General utilities
│   └── validations.ts               # Validation schemas
│
├── 📁 store/                        # State management (Zustand)
│   ├── auth-store.ts                # Authentication state
│   ├── location-store.ts            # Location state
│   └── index.ts
│
├── 📁 types/                        # TypeScript definitions
│   └── index.ts                     # All type definitions
│
├── 📁 public/                       # Static assets
│   ├── 📁 assets/
│   │   ├── icons/
│   │   └── images/
│   └── 📁 uploads/
│       └── profiles/
│
└── 📄 Configuration Files
    ├── .eslintrc.json               # ESLint configuration
    ├── .gitignore                   # Git ignore rules
    ├── jest.config.js               # Jest testing configuration
    ├── jest.setup.js                # Jest setup file
    ├── next.config.js               # Next.js configuration
    ├── package.json                 # Dependencies & scripts
    ├── postcss.config.js            # PostCSS configuration
    ├── tailwind.config.js           # Tailwind CSS configuration
    └── tsconfig.json                # TypeScript configuration
```

### Key Configuration Files

#### `package.json` - Dependencies & Scripts
```json
{
  "name": "tawa",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest"
  }
}
```

#### `tsconfig.json` - TypeScript Configuration
- Path aliases for clean imports (`@/components`, `@/lib`, etc.)
- Strict type checking enabled
- Next.js optimizations

#### `tailwind.config.js` - Styling Configuration
- Custom color palette
- Responsive breakpoints
- Component-specific utilities

---

## Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with latest features
- **TypeScript 5.3**: Type-safe development

### Styling & UI
- **Tailwind CSS 3.3**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **clsx & tailwind-merge**: Conditional styling utilities

### State Management
- **Zustand 4.4**: Lightweight state management
- **React Hook Form**: Form state management
- **Local Storage**: Client-side persistence

### Backend & Database
- **Next.js API Routes**: Server-side endpoints
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

### Development Tools
- **ESLint**: Code linting
- **Jest**: Testing framework
- **Testing Library**: Component testing
- **PostCSS**: CSS processing

### Validation & Forms
- **Zod**: Schema validation
- **Hookform Resolvers**: Form validation integration
- **React Hook Form**: Form management

---

## Current Implementation Status

### ✅ Completed Features

#### Authentication System
- User registration (Customer & Provider)
- Secure login/logout
- JWT token management
- Password hashing with bcryptjs
- Protected routes

#### User Profile Management
- Profile creation and editing
- Profile picture upload
- Account settings
- Privacy settings
- Notification preferences
- Password change functionality

#### UI Components Library
- Reusable button, input, textarea components
- Responsive navbar with authentication states
- Footer component
- Profile management components
- Form components with validation

#### Core Infrastructure
- Next.js 14 App Router setup
- TypeScript configuration
- Tailwind CSS styling system
- MongoDB database connection
- State management with Zustand
- Testing setup with Jest

### 🚧 In Progress Features

#### Service Discovery System
- Basic search preview component
- Location-based services (hooks implemented)
- Service categories and filtering

#### Onboarding Flow
- Get-started pages structure
- Role selection (Customer/Provider)
- Multi-step registration process

### 📋 Planned Features

#### Booking System
- Service booking creation
- Booking status management
- Calendar integration
- Payment processing

#### Provider Dashboard
- Service management
- Booking management
- Analytics and reporting
- Availability management

#### Communication System
- In-app messaging
- Real-time notifications
- Email notifications

---

## Future Architecture Roadmap

### Phase 1: Core Platform Completion (Next 3 months)

#### Service Management System
```
📁 app/
├── 📁 services/
│   ├── page.tsx                     # Service listing page
│   ├── [id]/
│   │   └── page.tsx                 # Service detail page
│   └── create/
│       └── page.tsx                 # Service creation page
│
📁 components/
├── 📁 services/
│   ├── service-card.tsx
│   ├── service-grid.tsx
│   ├── service-filters.tsx
│   ├── service-form.tsx
│   └── service-search.tsx
│
📁 app/api/
├── 📁 services/
│   ├── route.ts                     # GET, POST services
│   ├── [id]/
│   │   └── route.ts                 # GET, PUT, DELETE service
│   └── search/
│       └── route.ts                 # Service search endpoint
```

#### Booking System
```
📁 app/
├── 📁 bookings/
│   ├── page.tsx                     # Booking list page
│   ├── [id]/
│   │   └── page.tsx                 # Booking detail page
│   └── create/
│       └── page.tsx                 # Booking creation page
│
📁 components/
├── 📁 bookings/
│   ├── booking-card.tsx
│   ├── booking-form.tsx
│   ├── booking-status.tsx
│   ├── booking-calendar.tsx
│   └── booking-timeline.tsx
│
📁 app/api/
├── 📁 bookings/
│   ├── route.ts                     # GET, POST bookings
│   ├── [id]/
│   │   └── route.ts                 # GET, PUT, DELETE booking
│   └── status/
│       └── route.ts                 # Update booking status
```

#### Enhanced Database Models
```
📁 lib/models/
├── User.ts                          # ✅ Existing
├── Service.ts                       # 🆕 New
├── Booking.ts                       # 🆕 New
├── Review.ts                        # 🆕 New
├── Category.ts                      # 🆕 New
└── Location.ts                      # 🆕 New
```

### Phase 2: Real-time Features (Months 4-6)

#### Hybrid Architecture Implementation
```
📁 darigo-realtime/                  # 🆕 NestJS Microservice
├── 📁 src/
│   ├── 📁 auth/
│   │   ├── auth.guard.ts
│   │   └── jwt.strategy.ts
│   ├── 📁 bookings/
│   │   ├── bookings.gateway.ts      # WebSocket gateway
│   │   ├── bookings.service.ts
│   │   └── bookings.module.ts
│   ├── 📁 chat/
│   │   ├── chat.gateway.ts
│   │   ├── chat.service.ts
│   │   └── chat.module.ts
│   ├── 📁 notifications/
│   │   ├── notifications.gateway.ts
│   │   ├── notifications.service.ts
│   │   └── notifications.module.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

#### Real-time Communication System
```
📁 components/
├── 📁 chat/
│   ├── chat-window.tsx
│   ├── message-list.tsx
│   ├── message-input.tsx
│   └── chat-provider.tsx
│
📁 hooks/
├── use-websocket.ts                 # WebSocket connection hook
├── use-chat.ts                      # Chat functionality hook
├── use-notifications.ts             # Real-time notifications
└── use-booking-status.ts            # Live booking updates
```

#### Enhanced State Management
```
📁 store/
├── auth-store.ts                    # ✅ Existing
├── location-store.ts                # ✅ Existing
├── booking-store.ts                 # 🆕 New
├── chat-store.ts                    # 🆕 New
├── notification-store.ts            # 🆕 New
└── websocket-store.ts               # 🆕 New
```

### Phase 3: Advanced Features (Months 7-12)

#### Payment Integration
```
📁 app/api/
├── 📁 payments/
│   ├── stripe/
│   │   ├── create-intent/
│   │   ├── confirm-payment/
│   │   └── webhooks/
│   └── paypal/
│       ├── create-order/
│       └── capture-order/
│
📁 components/
├── 📁 payments/
│   ├── payment-form.tsx
│   ├── payment-methods.tsx
│   ├── payment-status.tsx
│   └── invoice.tsx
```

#### Analytics & Reporting
```
📁 app/
├── 📁 dashboard/
│   ├── 📁 analytics/
│   │   ├── page.tsx                 # Analytics dashboard
│   │   ├── revenue/
│   │   ├── bookings/
│   │   └── customers/
│   └── 📁 reports/
│       ├── page.tsx                 # Reports page
│       ├── export/
│       └── scheduled/
│
📁 components/
├── 📁 analytics/
│   ├── charts/
│   │   ├── revenue-chart.tsx
│   │   ├── booking-trends.tsx
│   │   └── customer-metrics.tsx
│   ├── kpi-cards.tsx
│   └── date-range-picker.tsx
```

#### Mobile Application (React Native)
```
📁 darigo-mobile/                    # 🆕 React Native App
├── 📁 src/
│   ├── 📁 screens/
│   │   ├── auth/
│   │   ├── services/
│   │   ├── bookings/
│   │   └── profile/
│   ├── 📁 components/
│   ├── 📁 navigation/
│   ├── 📁 store/
│   └── 📁 utils/
├── package.json
└── app.json
```

### Phase 4: Enterprise Features (Year 2)

#### Microservices Architecture
```
📁 darigo-ecosystem/
├── 📁 darigo-web/                   # Main Next.js app
├── 📁 darigo-api/                   # Core API service
├── 📁 darigo-realtime/              # Real-time service
├── 📁 darigo-payments/              # Payment service
├── 📁 darigo-notifications/         # Notification service
├── 📁 darigo-analytics/             # Analytics service
├── 📁 darigo-mobile/                # Mobile app
├── 📁 darigo-admin/                 # Admin dashboard
└── 📁 darigo-infrastructure/        # DevOps & deployment
```

#### Advanced Infrastructure
```
📁 infrastructure/
├── 📁 kubernetes/
│   ├── deployments/
│   ├── services/
│   ├── ingress/
│   └── configmaps/
├── 📁 docker/
│   ├── web.Dockerfile
│   ├── api.Dockerfile
│   └── realtime.Dockerfile
├── 📁 terraform/
│   ├── aws/
│   ├── gcp/
│   └── azure/
└── 📁 monitoring/
    ├── prometheus/
    ├── grafana/
    └── elk-stack/
```

---

## Scalability & Performance

### Current Performance Optimizations
- **Next.js 14 App Router**: Automatic code splitting and optimization
- **Image Optimization**: Next.js built-in image optimization
- **Static Generation**: Pre-rendered pages where possible
- **Client-side Caching**: Zustand for state persistence

### Planned Performance Enhancements

#### Database Optimization
- **Connection Pooling**: MongoDB connection optimization
- **Indexing Strategy**: Optimized database indexes
- **Caching Layer**: Redis for frequently accessed data
- **Database Sharding**: Horizontal scaling for large datasets

#### Frontend Performance
- **Bundle Optimization**: Code splitting and lazy loading
- **CDN Integration**: Static asset delivery optimization
- **Service Workers**: Offline functionality and caching
- **Progressive Web App**: PWA features for mobile experience

#### Backend Scalability
- **Load Balancing**: Multiple server instances
- **Microservices**: Service-specific scaling
- **Message Queues**: Asynchronous processing with Redis/RabbitMQ
- **API Rate Limiting**: Request throttling and protection

### Infrastructure Scaling Plan

#### Phase 1: Single Server (Current)
- Next.js application on single server
- MongoDB database
- Basic monitoring

#### Phase 2: Horizontal Scaling
- Load balancer with multiple app instances
- Database replica sets
- Redis caching layer
- CDN for static assets

#### Phase 3: Microservices
- Container orchestration (Kubernetes)
- Service mesh (Istio)
- Distributed monitoring (Prometheus/Grafana)
- Auto-scaling based on metrics

#### Phase 4: Multi-region
- Global CDN
- Multi-region database clusters
- Edge computing for real-time features
- Advanced monitoring and alerting

---

## Security Implementation

### Current Security Measures
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Zod schema validation
- **HTTPS Enforcement**: Secure communication
- **Environment Variables**: Sensitive data protection

### Enhanced Security Roadmap

#### Authentication & Authorization
- **Multi-factor Authentication (MFA)**: SMS/Email/App-based 2FA
- **OAuth Integration**: Google, Facebook, Apple sign-in
- **Role-based Access Control (RBAC)**: Granular permissions
- **Session Management**: Advanced session handling
- **Account Lockout**: Brute force protection

#### Data Protection
- **Data Encryption**: At-rest and in-transit encryption
- **PII Protection**: Personal data anonymization
- **GDPR Compliance**: Data privacy regulations
- **Audit Logging**: Comprehensive activity tracking
- **Data Backup**: Encrypted backup strategies

#### API Security
- **Rate Limiting**: API abuse prevention
- **API Keys**: Service-to-service authentication
- **Input Sanitization**: XSS and injection prevention
- **CORS Configuration**: Cross-origin request security
- **Security Headers**: Comprehensive security headers

#### Infrastructure Security
- **WAF (Web Application Firewall)**: Attack prevention
- **DDoS Protection**: Distributed attack mitigation
- **Vulnerability Scanning**: Regular security assessments
- **Penetration Testing**: Professional security testing
- **Security Monitoring**: Real-time threat detection

---

## Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking required
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting consistency
- **Conventional Commits**: Standardized commit messages
- **Code Reviews**: Mandatory peer reviews

### Testing Strategy
- **Unit Tests**: Jest for component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Cypress for user flow testing
- **Performance Tests**: Load testing for scalability
- **Security Tests**: Automated vulnerability scanning

### Deployment Pipeline
- **CI/CD**: GitHub Actions for automated deployment
- **Environment Management**: Development, staging, production
- **Feature Flags**: Gradual feature rollouts
- **Blue-Green Deployment**: Zero-downtime deployments
- **Rollback Strategy**: Quick rollback capabilities

### Monitoring & Observability
- **Application Monitoring**: Performance and error tracking
- **User Analytics**: Usage patterns and behavior
- **Business Metrics**: KPI tracking and reporting
- **Alerting**: Proactive issue notification
- **Logging**: Comprehensive application logging

---

## Conclusion

The Darigo platform is architected for scalability, maintainability, and performance. The current foundation provides a solid base for rapid feature development, while the roadmap ensures the platform can grow to serve millions of users across multiple regions.

The hybrid architecture approach allows for incremental complexity, starting with a monolithic Next.js application and evolving into a microservices ecosystem as the business grows.

Key success factors:
- **Modular Architecture**: Easy to extend and maintain
- **Type Safety**: Reduced bugs and improved developer experience
- **Performance First**: Optimized for speed and scalability
- **Security by Design**: Built-in security from the ground up
- **Developer Experience**: Tools and processes that enable rapid development

This documentation serves as a living guide that will be updated as the platform evolves and new requirements emerge.