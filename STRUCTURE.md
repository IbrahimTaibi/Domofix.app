# Tawa Project Structure

## Overview

This document outlines the complete project structure for Tawa, a hyperlocal services platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Directory Structure

```
tawa/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── 📁 (customer)/               # Customer dashboard routes
│   │   ├── bookings/
│   │   ├── search/
│   │   └── layout.tsx
│   ├── 📁 (provider)/               # Provider dashboard routes
│   │   ├── dashboard/
│   │   ├── services/
│   │   ├── bookings/
│   │   └── layout.tsx
│   ├── 📁 api/                      # API routes
│   │   ├── auth/
│   │   ├── services/
│   │   ├── bookings/
│   │   ├── reviews/
│   │   └── health/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   ├── globals.css                  # Global styles
│   └── favicon.ico
│
├── 📁 components/                    # React components
│   ├── 📁 ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── badge.tsx
│   │   └── index.ts
│   ├── 📁 features/                 # Feature-specific components
│   │   ├── 📁 services/
│   │   ├── 📁 bookings/
│   │   ├── 📁 providers/
│   │   └── 📁 search/
│   ├── 📁 layout/                   # Layout components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   └── index.ts
│
├── 📁 lib/                          # Utility functions & helpers
│   ├── 📁 api/                      # API clients
│   │   ├── client.ts
│   │   ├── services.ts
│   │   ├── bookings.ts
│   │   └── auth.ts
│   ├── utils.ts                     # Helper functions
│   ├── constants.ts                 # App constants
│   └── validations.ts               # Zod schemas
│
├── 📁 hooks/                        # Custom React hooks
│   ├── use-location.ts
│   ├── use-debounce.ts
│   ├── use-services.ts
│   ├── use-bookings.ts
│   └── index.ts
│
├── 📁 store/                        # Zustand state management
│   ├── auth-store.ts
│   ├── location-store.ts
│   ├── booking-store.ts
│   └── index.ts
│
├── 📁 types/                        # TypeScript definitions
│   ├── index.ts                    # All type definitions
│   └── schemas.ts                   # Shared schemas
│
├── 📁 public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── 📄 Configuration Files
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── .gitignore
│   └── README.md
```

## Key Files Explained

### Configuration Files

- **`package.json`**: Project dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration with path aliases
- **`next.config.js`**: Next.js configuration (images, server actions, etc.)
- **`tailwind.config.js`**: Tailwind CSS theme configuration
- **`.eslintrc.json`**: ESLint configuration

### Core Files

#### `/app`
- **`layout.tsx`**: Root layout with metadata and global styles
- **`page.tsx`**: Home page
- **`globals.css`**: Global Tailwind imports and CSS variables
- **`/api`**: RESTful API routes for backend operations

#### `/types`
- **`index.ts`**: All TypeScript interfaces and types:
  - User, Provider, Service types
  - Booking, Review types
  - Location, Search types
  - API response types

#### `/lib`
- **`utils.ts`**: Utility functions (cn, formatCurrency, calculateDistance, etc.)
- **`constants.ts`**: App constants, categories, API endpoints
- **`validations.ts`**: Zod validation schemas
- **`api/client.ts`**: Centralized API client for all requests

#### `/components`
- **`ui/`**: Reusable UI components (Button, Input, Card, etc.)
- **`features/`**: Feature-specific components grouped by domain
- **`layout/`**: Layout components (Navbar, Footer, Sidebar)

#### `/hooks`
- **`use-location.ts`**: Geolocation hook
- **`use-debounce.ts`**: Debounce hook for search

#### `/store`
- **`auth-store.ts`**: Authentication state management
- **`location-store.ts`**: Location state management

## Architecture Principles

### 1. Separation of Concerns
- **UI**: Components focus only on presentation
- **Logic**: Custom hooks handle business logic
- **State**: Zustand manages global state
- **Data**: Types ensure type safety across the app

### 2. Scalability
- Route groups for feature separation
- Modular components that can be easily extended
- Centralized API client for consistent data fetching
- Reusable utility functions

### 3. Type Safety
- Comprehensive TypeScript types
- Zod validation schemas
- Path aliases for clean imports

### 4. Developer Experience
- Clear folder structure
- Consistent naming conventions
- Helpful comments and documentation
- Easy-to-use utility functions

## Next Steps

1. **Install Dependencies**: `npm install`
2. **Run Development Server**: `npm run dev`
3. **Build Features**: Start building features in their respective directories
4. **Extend Types**: Add more types as features grow
5. **Add Components**: Build UI components as needed

## Best Practices

1. **Keep components small and focused**
2. **Use TypeScript strictly**
3. **Follow the existing folder structure**
4. **Add comments for complex logic**
5. **Keep the store minimal (only global state)**
6. **Use API client for all data fetching**
7. **Validate forms with Zod**
8. **Keep styles in Tailwind classes**

