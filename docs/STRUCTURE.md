# Project Structure

This document provides a detailed overview of the Darigo project structure and organization principles.

## 🏗️ Monorepo Architecture

Darigo uses a monorepo structure with npm workspaces to manage multiple applications and shared packages.

```
Darigo/
├── apps/                  # Applications
├── packages/              # Shared packages
├── docs/                  # Documentation
├── package.json           # Root workspace configuration
└── .gitignore            # Git ignore rules
```

## 📱 Applications (`/apps`)

### Frontend (`/apps/frontend`)

Next.js 14 application with App Router and feature-based architecture.

```
frontend/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Route groups
│   ├── get-started/      # Get started pages
│   ├── profile/          # Profile pages
│   ├── register/         # Registration pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── features/             # Feature-based modules
│   ├── auth/            # Authentication feature
│   ├── get-started/     # Onboarding feature
│   ├── profile/         # Profile management
│   ├── providers/       # Provider management
│   └── search/          # Search functionality
├── shared/              # Shared resources
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Global state management
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── jest.config.js       # Jest configuration
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

#### Feature Structure

Each feature follows a consistent structure:

```
feature-name/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── services/           # API services and business logic
├── store/              # Feature-specific state
├── tests/              # Feature tests
└── types/              # Feature-specific types
```

#### Shared Resources

```
shared/
├── components/
│   ├── layout/         # Layout components (navbar, footer)
│   ├── sections/       # Page sections (hero, features)
│   ├── button.tsx      # Button component
│   ├── input.tsx       # Input component
│   └── index.ts        # Component exports
├── hooks/
│   ├── use-debounce.ts # Debounce hook
│   ├── use-form.ts     # Form management hook
│   ├── use-mobile.ts   # Mobile detection hook
│   └── index.ts        # Hook exports
├── store/
│   ├── location-store.ts # Location state
│   └── index.ts        # Store exports
├── types/
│   ├── globals.d.ts    # Global type definitions
│   └── index.ts        # Type exports
└── utils/
    ├── api.ts          # API utilities
    ├── constants.ts    # Application constants
    ├── validations.ts  # Validation schemas
    ├── error-tracking.ts # Lightweight error tracking utility
    └── index.ts        # Utility exports

### Error Handling Flow (Frontend)

The frontend uses Next.js App Router error boundaries and shared components/utilities to provide consistent error UX:

- Pages
  - `app/not-found.tsx`: Global 404 page for unmatched routes
  - `app/error.tsx`: Route-level error boundary rendering a friendly error view with retry
  - `app/global-error.tsx`: Root error boundary for initial render failures
  - `app/403/page.tsx`: Explicit 403 forbidden page
  - `app/500/page.tsx`: Explicit 500 internal error page

- Shared Component
  - `shared/components/error/error-view.tsx`: Reusable error presentation component (icon, title, description, actions) using shared `Button`

- Error Tracking
  - `shared/utils/error-tracking.ts`: Logs errors to console and optionally posts to `NEXT_PUBLIC_ERROR_TRACKING_URL`

- API Client Errors
  - `shared/utils/api.ts`: Throws a typed `HttpError` with `statusCode` for non-OK responses, enabling error boundaries and UI to react based on HTTP status.

This approach keeps error UI modular, reusable, and aligned with the existing design system while covering both client-side routing errors and server-side HTTP failures.
```

### Backend (`/apps/backend`)

NestJS application with modular architecture.

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── decorators/ # Custom decorators
│   │   ├── dto/        # Data Transfer Objects
│   │   ├── guards/     # Authentication guards
│   │   └── strategies/ # Passport strategies
│   ├── users/          # User management module
│   │   ├── entities/   # Database entities
│   │   └── schemas/    # Mongoose schemas
│   ├── app.module.ts   # Root application module
│   └── main.ts         # Application entry point
├── test/               # End-to-end tests
├── nest-cli.json       # Nest CLI configuration
└── tsconfig.json       # TypeScript configuration
```

## 📦 Packages (`/packages`)

Shared packages used across applications.

### Shared Types (`/packages/shared-types`)

Common TypeScript type definitions.

```
shared-types/
├── src/
│   ├── api.ts          # API-related types
│   ├── auth.ts         # Authentication types
│   └── index.ts        # Type exports
├── package.json
└── tsconfig.json
```

### Shared Utils (`/packages/shared-utils`)

Common utility functions.

```
shared-utils/
├── src/
│   ├── auth.ts         # Authentication utilities
│   ├── date.ts         # Date utilities
│   ├── validation.ts   # Validation utilities
│   └── index.ts        # Utility exports
├── package.json
└── tsconfig.json
```

### ESLint Config (`/packages/eslint-config`)

Shared ESLint configuration for consistent code style.

## 🎯 Design Principles

### 1. Feature-Based Organization

- Each feature is self-contained with its own components, hooks, services, and types
- Promotes modularity and maintainability
- Easy to locate and modify feature-specific code

### 2. Shared Resources

- Common components, hooks, and utilities are centralized in `/shared`
- Prevents code duplication
- Ensures consistency across features

### 3. Type Safety

- Full TypeScript coverage across all applications
- Shared types in dedicated packages
- Strict type checking enabled

### 4. Separation of Concerns

- Clear separation between UI components, business logic, and data access
- Services handle API calls and business logic
- Components focus on presentation
- Hooks manage component state and side effects

### 5. Scalability

- Monorepo structure allows for easy addition of new applications
- Feature-based architecture supports team scaling
- Shared packages promote code reuse

## 📁 File Naming Conventions

### Components
- PascalCase for component files: `UserProfile.tsx`
- kebab-case for component directories: `user-profile/`
- Index files for clean imports: `index.ts`

### Hooks
- Prefix with `use`: `useAuth.ts`, `useForm.ts`
- kebab-case for multi-word hooks: `use-local-storage.ts`

### Utilities
- kebab-case: `api-client.ts`, `date-utils.ts`
- Descriptive names: `validations.ts`, `constants.ts`

### Types
- PascalCase for interfaces and types: `User`, `ApiResponse`
- Suffix with appropriate descriptor: `UserDto`, `AuthState`

## 🔄 Import Patterns

### Path Aliases

TypeScript path aliases are configured for clean imports:

```typescript
// Frontend aliases
import { Button } from '@/shared/components'
import { useAuth } from '@/features/auth/hooks'
import { UserProfile } from '@/features/profile/components'

// Shared package imports
import { User } from '@darigo/shared-types'
import { validateEmail } from '@darigo/shared-utils'
```

### Import Organization

Imports should be organized in the following order:

1. External libraries (React, Next.js, etc.)
2. Internal shared packages
3. Shared resources
4. Feature-specific imports
5. Relative imports

```typescript
// External
import React from 'react'
import { NextPage } from 'next'

// Shared packages
import { User } from '@darigo/shared-types'

// Shared resources
import { Button } from '@/shared/components'
import { useAuth } from '@/shared/hooks'

// Feature-specific
import { ProfileForm } from '@/features/profile/components'

// Relative
import './styles.css'
```

## 🧪 Testing Structure

Tests are co-located with their respective features:

```
feature/
├── components/
│   ├── UserForm.tsx
│   └── UserForm.test.tsx
├── hooks/
│   ├── useUser.ts
│   └── useUser.test.ts
└── tests/
    └── integration.test.tsx
```

## 📝 Configuration Files

### Root Level
- `package.json` - Workspace configuration and scripts
- `.gitignore` - Git ignore patterns
- `README.md` - Project overview

### Application Level
- `package.json` - Application dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- Configuration files specific to the framework (Next.js, NestJS)

This structure promotes maintainability, scalability, and developer experience while ensuring clear separation of concerns and code organization.