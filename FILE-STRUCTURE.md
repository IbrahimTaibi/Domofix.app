# Domofix Project - File Structure

> **Generated**: 2025-11-22
> **Project**: Domofix - Service Marketplace Platform
> **Type**: Monorepo (Turborepo)

---

## 📦 Root Structure

```
domofix/
├── apps/                    # Application packages
│   ├── backend/            # NestJS API server
│   └── frontend/           # Next.js web application
├── packages/               # Shared packages
│   ├── shared-types/       # TypeScript type definitions
│   └── shared-utils/       # Shared utility functions
├── docs/                   # Project documentation
├── .turbo/                 # Turborepo cache
├── .trae/                  # AI documentation & guides
├── .claude/                # Claude Code settings
├── package.json            # Root package.json (workspace)
├── turbo.json             # Turborepo configuration
├── tsconfig.base.json     # Base TypeScript config
├── CLAUDE.md              # Project overview for AI
└── FILE-STRUCTURE.md      # This file
```

---

## 🔧 Backend (`apps/backend`)

### Root Files
```
apps/backend/
├── src/                    # Source code
├── test/                   # E2E tests
├── uploads/                # File uploads storage
├── nest-cli.json          # NestJS CLI configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Backend dependencies
├── .env                   # Environment variables (local)
├── .env.example           # Environment template
├── ERRORS.md              # Error handling documentation
└── README.md              # Backend documentation
```

### Source Structure (`apps/backend/src`)

#### Main Application
```
src/
├── main.ts                # Application entry point
├── app.module.ts          # Root module
├── app.controller.ts      # Root controller
└── app.service.ts         # Root service
```

#### Authentication Module (`src/auth`)
```
auth/
├── auth.controller.ts                # Auth endpoints
├── auth.service.ts                   # Auth business logic
├── auth.module.ts                    # Auth module definition
├── refresh-tokens.service.ts         # Refresh token management
├── dto/                              # Data Transfer Objects
│   ├── index.ts
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── refresh.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   ├── change-password.dto.ts
│   ├── logout.dto.ts
│   └── oauth-login.dto.ts
├── guards/                           # Route guards
│   ├── jwt-auth.guard.ts
│   ├── jwt-query.guard.ts
│   ├── roles.guard.ts
│   └── roles.guard.spec.ts
├── decorators/                       # Custom decorators
│   └── roles.decorator.ts
├── strategies/                       # Passport strategies
│   └── jwt.strategy.ts
├── schemas/                          # Database schemas
│   └── refresh-token.schema.ts
└── listeners/                        # Event listeners
    └── auth-events.listener.ts
```

#### Users Module (`src/users`)
```
users/
├── users.controller.ts               # User endpoints
├── users.service.ts                  # User business logic
├── users.service.spec.ts             # Unit tests
├── users.module.ts                   # Module definition
├── entities/
│   └── user.entity.ts                # User entity
└── schemas/
    └── user.schema.ts                # Mongoose schema
```

#### Requests Module (`src/requests`)
```
requests/
├── requests.controller.ts            # Request endpoints
├── requests.controller.spec.ts       # Controller tests
├── requests.service.ts               # Request business logic
├── requests.service.spec.ts          # Service tests
├── requests.module.ts                # Module definition
├── expiration.service.ts             # Request expiration logic
├── dto/
│   ├── create-request.dto.ts
│   ├── list-requests.query.ts
│   ├── apply-for-request.dto.ts
│   ├── accept-provider.dto.ts
│   └── complete-request.dto.ts
├── schemas/
│   └── request.schema.ts             # Request schema
└── listeners/
    └── request-events.listener.ts    # Event listeners
```

#### Orders Module (`src/orders`)
```
orders/
├── orders.controller.ts              # Order endpoints
├── orders.service.ts                 # Order business logic
├── orders.module.ts                  # Module definition
├── dto/
│   ├── list-orders.query.ts
│   ├── start-order.dto.ts
│   ├── complete-order.dto.ts
│   ├── cancel-order.dto.ts
│   └── set-ets.dto.ts
├── schemas/
│   └── order.schema.ts               # Order schema
└── listeners/
    └── request-to-order.listener.ts  # Order creation listener
```

#### Provider Services Module (`src/provider-services`)
```
provider-services/
├── provider-services.controller.ts   # Service endpoints
├── provider-services.service.ts      # Service business logic
├── provider-services.module.ts       # Module definition
├── dto/
│   ├── create-provider-service.dto.ts
│   ├── update-provider-service.dto.ts
│   ├── query-provider-services.dto.ts
│   └── create-service-request.dto.ts
└── schemas/
    └── provider-service.schema.ts    # Service schema
```

#### Provider Applications Module (`src/provider-applications`)
```
provider-applications/
├── provider-applications.controller.ts  # Application endpoints
├── provider-applications.service.ts     # Application logic
├── provider-applications.module.ts      # Module definition
├── dto/
│   ├── create-provider-application.dto.ts
│   └── update-status.dto.ts
├── schemas/
│   └── provider-application.schema.ts   # Application schema
└── listeners/
    └── provider-applications.listener.ts # Event listeners
```

#### Reviews Module (`src/reviews`)
```
reviews/
├── reviews.controller.ts             # Review endpoints
├── reviews.service.ts                # Review business logic
├── reviews.module.ts                 # Module definition
├── dto/
│   ├── create-review.dto.ts
│   ├── update-review.dto.ts
│   ├── list-reviews.query.ts
│   ├── create-comment.dto.ts
│   ├── list-comments.query.ts
│   └── provider-stats.query.ts
└── schemas/
    ├── review.schema.ts              # Review schema
    └── comment.schema.ts             # Comment schema
```

#### Messaging Module (`src/messaging`)
```
messaging/
├── messaging.controller.ts           # Message endpoints
├── messaging.service.ts              # Messaging logic
├── messaging.gateway.ts              # Socket.IO gateway
├── messaging.module.ts               # Module definition
├── dto/
│   ├── create-thread.dto.ts
│   ├── send-message.dto.ts
│   ├── list-threads.query.ts
│   ├── list-messages.query.ts
│   └── mark-read.dto.ts
├── schemas/
│   ├── thread.schema.ts              # Thread schema
│   └── message.schema.ts             # Message schema
└── listeners/
    └── order-status.listener.ts      # Order event listener
```

#### Notifications Module (`src/notifications`)
```
notifications/
├── notifications.controller.ts       # Notification endpoints
├── notifications.service.ts          # Notification logic
├── notifications.gateway.ts          # Socket.IO gateway
├── notifications.sse.controller.ts   # Server-Sent Events
├── notifications.module.ts           # Module definition
└── schemas/
    └── notification.schema.ts        # Notification schema
```

#### Common/Shared (`src/common`)
```
common/
├── db/                               # Database utilities
│   ├── retry.util.ts
│   ├── retry.util.spec.ts
│   ├── transaction.util.ts
│   ├── transaction.util.spec.ts
│   └── simple-backoff.ts
├── errors/                           # Error handling
│   └── app-error.ts
├── filters/                          # Exception filters
│   └── global-exception.filter.ts
├── interceptors/                     # Request interceptors
│   └── sanitize.interceptor.ts
├── logging/                          # Logging service
│   ├── logger.service.ts
│   └── logger.service.spec.ts
├── monitoring/                       # Monitoring service
│   └── monitoring.service.ts
├── geocoding/                        # Geocoding service
│   ├── geocoding.service.ts
│   └── geocoding.service.spec.ts
├── validators/                       # Custom validators
│   ├── future-date.validator.ts
│   ├── future-date.validator.spec.ts
│   ├── phone-number.validator.ts
│   ├── phone-number.validator.spec.ts
│   └── require-one-of.validator.ts
└── utils/                            # Utility functions
    ├── redact.util.ts
    └── redact.util.spec.ts
```

#### Email Service (`src/email`)
```
email/
└── email.service.ts                  # Brevo/Sendinblue integration
```

#### Seeds (`src/seeds`)
```
seeds/
└── seed.ts                           # Database seeding script
```

### Tests (`apps/backend/test`)
```
test/
├── app.e2e-spec.ts                   # Application E2E tests
├── error-handling.e2e-spec.ts        # Error handling tests
└── requests.e2e-spec.ts              # Requests E2E tests
```

### Uploads (`apps/backend/uploads`)
```
uploads/
├── provider-documents/               # Provider verification docs
└── request-photos/                   # Request photos
```

---

## 🎨 Frontend (`apps/frontend`)

### Root Files
```
apps/frontend/
├── app/                    # Next.js App Router
├── features/               # Feature modules
├── shared/                 # Shared components & utilities
├── lib/                    # Library integrations
├── public/                 # Static assets
├── __tests__/              # Tests
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
├── package.json           # Frontend dependencies
├── .env.local             # Environment variables
└── jest.setup.js          # Jest configuration
```

### App Router (`app/`)
```
app/
├── layout.tsx                        # Root layout
├── page.tsx                          # Homepage
├── providers.tsx                     # Context providers
├── globals.css                       # Global styles
├── error.tsx                         # Error boundary
├── global-error.tsx                  # Global error handler
├── not-found.tsx                     # 404 page
├── 403/page.tsx                      # Forbidden page
├── 500/page.tsx                      # Server error page
├── about/page.tsx                    # About page
├── contact/page.tsx                  # Contact page
├── auth/                             # Authentication pages
│   ├── page.tsx                      # Login/Register
│   ├── popup-close/page.tsx          # OAuth popup closer
│   ├── forgot-password/page.tsx      # Forgot password
│   └── reset-password/page.tsx       # Reset password
├── register/                         # Registration flow
│   ├── layout.tsx                    # Registration layout
│   ├── page.tsx                      # Registration chooser
│   ├── customer/page.tsx             # Customer registration
│   └── provider/                     # Provider registration
│       ├── page.tsx
│       └── page.module.css
├── get-started/                      # Onboarding
│   ├── page.tsx                      # Get started home
│   ├── customer/page.tsx             # Customer onboarding
│   └── provider/page.tsx             # Provider onboarding
├── request-service/page.tsx          # Service request form
├── services/                         # Service pages
│   └── [serviceId]/
│       └── providers/
│           ├── page.tsx              # Providers list
│           └── [providerId]/page.tsx # Provider detail
├── history/page.tsx                  # Request history
├── messages/page.tsx                 # Messages page
├── notifications/page.tsx            # Notifications page
├── profile/page.tsx                  # User profile
├── orders/                           # Orders
│   └── [id]/page.tsx                 # Order detail
├── dashboard/                        # Dashboard redirect
│   ├── page.tsx
│   └── provider/                     # Provider dashboard
│       ├── layout.tsx                # Dashboard layout
│       ├── page.tsx                  # Dashboard overview
│       ├── requests/                 # Requests management
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── services/page.tsx         # Services management
│       ├── orders/page.tsx           # Orders list
│       ├── messages/page.tsx         # Messages
│       ├── reviews/page.tsx          # Reviews
│       ├── history/page.tsx          # History
│       ├── invoices/page.tsx         # Invoices
│       ├── settings/                 # Settings
│       │   ├── profile/page.tsx
│       │   └── abonnements/page.tsx
│       ├── team/                     # Team management
│       │   ├── page.tsx
│       │   ├── membres/page.tsx
│       │   ├── invitations/page.tsx
│       │   └── roles/page.tsx
│       └── support/                  # Support
│           └── help/page.tsx
└── api/                              # API routes
    └── auth/
        └── [...nextauth]/route.ts    # NextAuth endpoints
```

### Features (`features/`)

#### Authentication (`features/auth`)
```
auth/
├── components/
│   ├── auth-form.tsx
│   ├── customer-registration-form.tsx
│   ├── provider-registration-form.tsx
│   ├── forgot-password-form.tsx
│   ├── guards/
│   │   ├── customer-guard.tsx
│   │   ├── provider-guard.tsx
│   │   └── index.ts
│   ├── providers/
│   │   ├── auth-provider.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useAuth.ts
│   └── useAuthTokenReady.ts
├── store/
│   ├── auth-store.ts
│   └── index.ts
└── validation/
    └── schemas.ts
```

#### Requests (`features/requests`)
```
requests/
├── components/
│   ├── request-service-form.tsx
│   ├── request-card.tsx
│   └── history/
│       ├── request-history-list.tsx
│       ├── request-history-item.tsx
│       ├── request-status-badge.tsx
│       ├── history-toolbar.tsx
│       ├── history-filters.tsx
│       ├── history-empty.tsx
│       └── history-skeleton.tsx
├── hooks/
│   ├── useRequestService.ts
│   └── useRequestsHistory.ts
├── services/
│   └── requests-service.ts
├── store/
│   └── request-store.ts
└── README.md
```

#### Orders (`features/orders`)
```
orders/
├── components/
│   ├── order-card.tsx
│   ├── orders-list.tsx
│   ├── orders-filters.tsx
│   └── rating-modal.tsx
└── services/
    ├── orders-service.ts
    └── reviews-service.ts
```

#### Reviews (`features/reviews`)
```
reviews/
├── components/
│   ├── review-card.tsx
│   ├── review-stats-cards.tsx
│   ├── reviews-list.tsx
│   ├── reviews-filters.tsx
│   └── reviews-pagination.tsx
└── services/
    └── reviews-api.ts
```

#### Notifications (`features/notifications`)
```
notifications/
├── components/
│   ├── notification-item.tsx
│   ├── notification-panel.tsx
│   ├── notification-toolbar.tsx
│   ├── notifications-provider.tsx
│   └── providers/
│       └── notifications-provider.tsx
├── hooks/
│   ├── use-notifications.ts
│   └── use-notifications-socket.ts
├── services/
│   └── notifications-service.ts
├── store/
│   └── notifications-store.ts
├── utils/
│   └── browser-notifications.ts
└── index.ts
```

#### Widget (Chat) (`features/widget`)
```
widget/
├── components/
│   ├── widget.tsx
│   ├── bottom-nav.tsx
│   ├── contact-policy-card.tsx
│   ├── support-card.tsx
│   ├── messages/
│   │   ├── conversation-view.tsx
│   │   ├── thread-list.tsx
│   │   └── chat-composer.tsx
│   └── screens/
│       ├── home-screen.tsx
│       ├── messages-screen.tsx
│       └── help-screen.tsx
├── hooks/
│   └── useWidgetSocket.ts
├── services/
│   └── widget-messaging-service.ts
├── store/
│   ├── widget-store.ts
│   └── messages-store.ts
├── events/
│   └── widget-events.ts
├── types/
│   └── index.ts
├── mock/
│   └── messages-mock.ts
└── README.md
```

#### Profile (`features/profile`)
```
profile/
├── components/
│   ├── profile-header.tsx
│   ├── profile-header-panel.tsx
│   ├── profile-hero.tsx
│   ├── profile-info.tsx
│   ├── profile-tabs.tsx
│   ├── profile-skeleton.tsx
│   ├── summary-card.tsx
│   ├── edit-profile-form.tsx
│   ├── profile-picture-upload.tsx
│   ├── account-settings.tsx
│   ├── notification-settings.tsx
│   ├── privacy-settings.tsx
│   ├── change-password-modal.tsx
│   └── index.ts
├── hooks/
│   ├── use-profile.ts
│   └── index.ts
├── services/
│   ├── profile-service.ts
│   └── index.ts
└── types/
    └── index.ts
```

#### Provider Dashboard (`features/dashboard/provider`)
```
dashboard/provider/
├── components/
│   ├── header.tsx
│   ├── sidebar.tsx
│   ├── sidebar-menu.tsx
│   ├── sidebar-menu-sections.tsx
│   ├── avatar-button.tsx
│   ├── notification-button.tsx
│   ├── search.tsx
│   ├── title.tsx
│   ├── mobile-toggle.tsx
│   ├── desktop-toggle.tsx
│   └── dashboard/
│       ├── kpi-cards.tsx
│       ├── types.ts
│       ├── mock.ts
│       ├── activity/
│       │   └── recent-activity.tsx
│       ├── charts/
│       │   ├── orders-status-donut.tsx
│       │   ├── requests-category-bar.tsx
│       │   ├── revenue-bars.tsx
│       │   ├── revenue-trend.tsx
│       │   └── sparkline.tsx
│       └── tables/
│           └── top-services.tsx
├── messages/
│   ├── components/
│   │   ├── chat-header.tsx
│   │   ├── chat-window.tsx
│   │   ├── chat-composer.tsx
│   │   ├── conversations-list.tsx
│   │   ├── details-panel.tsx
│   │   ├── message-bubble.tsx
│   │   └── typing-indicator.tsx
│   ├── svc/
│   │   └── messages-service.ts
│   ├── store.ts
│   ├── types.ts
│   └── mock.ts
└── utils/
    └── page-title.ts
```

#### Provider Services (`features/provider-services`)
```
provider-services/
├── components/
│   ├── service-card.tsx
│   ├── service-form-modal.tsx
│   ├── services-list.tsx
│   ├── services-filters.tsx
│   ├── services-pagination.tsx
│   ├── services-stats-cards.tsx
│   ├── services-page-header.tsx
│   └── index.ts
└── services/
    └── provider-services-api.ts
```

#### Providers (`features/providers`)
```
providers/
├── components/
│   ├── provider-profile.tsx
│   ├── providers-list.tsx
│   ├── providers-header.tsx
│   ├── providers-filters.tsx
│   ├── sidebar-stats.tsx
│   ├── sidebar-safety.tsx
│   └── index.ts
├── services/
│   └── provider-service.ts
└── store/
    └── providers-selection-store.ts
```

#### Other Features
```
features/
├── about/
│   └── components/
│       ├── about-hero.tsx
│       ├── about-section.tsx
│       ├── team-member-card.tsx
│       ├── value-item.tsx
│       └── index.ts
├── contact/
│   └── components/
│       ├── contact-hero.tsx
│       ├── contact-form.tsx
│       ├── contact-methods.tsx
│       └── index.ts
└── get-started/
    └── components/
        ├── hero.tsx
        ├── role-chooser.tsx
        ├── cta-panel.tsx
        └── provider-section.tsx
```

### Shared (`shared/`)

#### Components (`shared/components`)
```
components/
├── layout/
│   ├── navbar.tsx
│   ├── secondary-navbar.tsx
│   ├── footer.tsx
│   ├── logo.tsx
│   ├── nav-links.tsx
│   ├── app-chrome.tsx
│   ├── app-footer.tsx
│   ├── root-main.tsx
│   └── index.ts
├── sections/
│   ├── hero.tsx
│   ├── features.tsx
│   ├── how-it-works.tsx
│   ├── providers.tsx
│   ├── stats.tsx
│   └── index.ts
├── badges/
│   ├── notification-dot.tsx
│   └── pro-badge.tsx
├── error/
│   ├── error-banner.tsx
│   ├── error-view.tsx
│   ├── offline-banner.tsx
│   └── index.ts
├── requests/
│   ├── request-card.tsx
│   ├── request-card.stories.tsx
│   ├── request-details.tsx
│   ├── requests-list.tsx
│   ├── requests-list.stories.tsx
│   ├── requests-list-rows.tsx
│   ├── requests-toolbar.tsx
│   ├── filters-bar.tsx
│   ├── filters-bar.stories.tsx
│   ├── status-badge.tsx
│   ├── meta-row.tsx
│   ├── list-empty.tsx
│   ├── list-skeleton.tsx
│   └── provider-requests-page.tsx
├── button.tsx
├── input.tsx
├── textarea.tsx
├── spinner.tsx
├── confirmation-dialog.tsx
├── date-time-picker.tsx
├── photo-uploader.tsx
├── search-preview.tsx
├── toast-container.tsx
└── index.ts
```

#### Hooks (`shared/hooks`)
```
hooks/
├── use-auth.ts
├── use-debounce.ts
├── use-form.ts
├── use-local-storage.ts
├── use-location.ts
├── use-location-data.ts
├── use-mobile.ts
├── use-multi-step-form.ts
├── use-validation.ts
├── use-toast.ts
├── use-requests.ts
├── use-provider-requests.ts
├── use-messages-socket.ts
├── use-notifications.ts
├── use-notifications-ws.ts
├── use-notifications-socketio.ts
├── useNetworkStatus.ts
├── tests/
│   ├── use-form.test.tsx
│   ├── use-local-storage.test.tsx
│   ├── use-location.test.ts
│   ├── use-mobile.test.ts
│   ├── use-multi-step-form.test.tsx
│   └── use-validation.test.tsx
└── index.ts
```

#### Store (`shared/store`)
```
store/
├── location-store.ts
├── notifications-store.ts
├── requests-ui-store.ts
├── toast-store.ts
└── index.ts
```

#### Utils (`shared/utils`)
```
utils/
├── api.ts
├── http.ts
├── analytics.ts
├── category-labels.ts
├── constants.ts
├── dom.ts
├── error-tracking.ts
├── error-types.ts
├── errors.ts
├── fonts.ts
├── formatting.ts
├── refs.ts
├── sound.ts
├── styles.ts
├── theme.ts
├── utils.ts
├── validations.ts
├── tests/
│   ├── formatting.test.ts
│   └── utils.test.ts
└── index.ts
```

#### Types (`shared/types`)
```
types/
└── globals.d.ts
```

### Tests (`__tests__/`)
```
__tests__/
├── about-page.test.tsx
├── contact-page.test.tsx
├── error-pages.test.tsx
├── error-view.test.tsx
├── api-error.test.tsx
├── http.test.ts
├── requests/
│   ├── filters-bar.test.tsx
│   ├── request-card.test.tsx
│   └── use-requests.test.tsx
└── widget/
    ├── bottom-nav.test.tsx
    ├── home-screen.test.tsx
    └── widget-store.test.ts
```

### Library (`lib/`)
```
lib/
└── auth.ts                           # NextAuth configuration
```

---

## 📦 Shared Packages

### Types Package (`packages/shared-types`)
```
packages/shared-types/
├── src/
│   ├── index.ts                      # Main exports
│   ├── api.ts                        # API types
│   ├── auth.ts                       # Auth types
│   ├── request.ts                    # Request types
│   ├── service.ts                    # Service types
│   ├── messaging.ts                  # Messaging types
│   └── notifications.ts              # Notification types
├── package.json
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

### Utils Package (`packages/shared-utils`)
```
packages/shared-utils/
├── src/
│   ├── index.ts                      # Main exports
│   ├── auth.ts                       # Auth utilities
│   ├── date.ts                       # Date utilities
│   └── validation.ts                 # Validation utilities
├── package.json
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

---

## 📚 Documentation (`docs/`)
```
docs/
├── README.md                         # Documentation index
├── API.md                            # API documentation
├── COMPONENTS.md                     # Component library
├── STRUCTURE.md                      # Project structure
├── TESTING.md                        # Testing guide
├── DEPLOYMENT.md                     # Deployment guide
└── CONTRIBUTING.md                   # Contribution guide
```

---

## 🤖 AI Documentation (`.trae/documents/`)
```
.trae/documents/
├── Add Review & Comment System (NestJS + Mongoose).md
├── Backend Messaging Module with Clear Rules (NestJS + Mongoose).md
├── Database Seeding_ Reset and Populate Sample Data.md
├── Enable Real‑Time Chat for Messaging (Backend + Frontend).md
├── Fix Auth and Complete Provider Selection Flow.md
├── Implement Backend Reviews Aligned With Current Architecture.md
├── Implement Messenger‑Style Provider Messages UI.md
├── Provider Dashboard Page with Animated Charts (Modular).md
├── Provider Messages UI (Messenger‑Style).md
├── Provider Requests (All) Page – Modular UI.md
├── Provider Requests Dashboard UI_UX — Component Architecture and Implementation Plan.md
├── Provider Selection Flow for Services.md
├── Provider Sidebar Hierarchy & Pro Badge Component.md
├── Redesign Cards on _history Page.md
├── Refine Messages UI_ Mobile Layout, Show More_Less, Wider Chat.md
├── Refine Provider Messages UI_ Mobile Layout, Show More_Less, Wider Chat.md
├── Store Addresses With Coordinates (Keep Original + Lat_Lon).md
└── Widget Backend Integration.md
```

---

## 🔧 Configuration Files

### Root Configuration
```
├── .gitignore                        # Git ignore rules
├── package.json                      # Root package config
├── package-lock.json                 # Dependency lock file
├── turbo.json                        # Turborepo config
├── tsconfig.base.json                # Base TypeScript config
├── jest.config.js                    # Jest configuration
└── CLAUDE.md                         # AI project overview
```

### Frontend Configuration
```
apps/frontend/
├── next.config.js                    # Next.js config
├── tailwind.config.js                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── tsconfig.json                     # TypeScript config
├── .eslintrc.json                    # ESLint config
├── jest.setup.js                     # Jest setup
└── next-env.d.ts                     # Next.js types
```

### Backend Configuration
```
apps/backend/
├── nest-cli.json                     # NestJS CLI config
├── tsconfig.json                     # TypeScript config
├── tsconfig.build.json               # Build TypeScript config
├── eslint.config.mjs                 # ESLint config
└── .prettierrc                       # Prettier config
```

---

## 📊 Project Statistics

- **Total Files**: 500+
- **Backend Modules**: 14 core modules
- **Frontend Features**: 15+ feature modules
- **Shared Components**: 50+ reusable components
- **Database Schemas**: 11 collections
- **API Endpoints**: 50+ REST endpoints
- **WebSocket Events**: 15+ real-time events
- **Test Files**: 20+ test suites

---

## 🗂️ Key Directories Summary

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `apps/backend/src` | Backend source code | 180+ |
| `apps/frontend/app` | Next.js pages | 50+ |
| `apps/frontend/features` | Feature modules | 200+ |
| `apps/frontend/shared` | Shared code | 100+ |
| `packages/` | Shared packages | 15+ |
| `docs/` | Documentation | 7 |

---

**Last Updated**: 2025-11-22
**Generated by**: Claude Code
**Project Version**: 1.0.0
