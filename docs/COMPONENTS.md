# Frontend Components Documentation

## Overview

The Darigo frontend is built with Next.js 14 and follows a feature-based architecture. Components are organized into shared components (reusable across the app) and feature-specific components.

## Architecture

```
apps/frontend/
├── shared/
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # Shared TypeScript types
└── features/
    ├── auth/               # Authentication components
    ├── profile/            # User profile components
    ├── get-started/        # Onboarding components
    └── [feature]/          # Other feature modules
```

---

## Shared Components

### UI Components

#### Button

A versatile button component with multiple variants and sizes.

**Location:** `@/shared/components/button.tsx`

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}
```

**Usage:**
```tsx
import { Button } from '@/shared/components'

// Primary button
<Button variant="primary" size="md">
  Click me
</Button>

// Loading state
<Button isLoading={true}>
  Processing...
</Button>

// Danger variant
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

**Variants:**
- `primary`: Blue background, white text (default)
- `secondary`: Gray background, dark text
- `outline`: Transparent background with border
- `ghost`: Transparent background, no border
- `danger`: Red background, white text

**Sizes:**
- `sm`: Small padding and text
- `md`: Medium padding and text (default)
- `lg`: Large padding and text

---

#### Input

A form input component with label, error handling, and icon support.

**Location:** `@/shared/components/input.tsx`

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: LucideIcon
}
```

**Usage:**
```tsx
import { Input } from '@/shared/components'
import { Mail } from 'lucide-react'

// Basic input
<Input 
  label="Email"
  type="email"
  placeholder="Enter your email"
  required
/>

// With icon
<Input 
  label="Email"
  icon={Mail}
  error="Invalid email format"
/>

// With helper text
<Input 
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
/>
```

**Features:**
- Automatic label association
- Error state styling
- Icon support (left-aligned)
- Helper text display
- Required field indicator (*)
- Focus states with primary color

---

#### Textarea

A textarea component with similar features to Input.

**Location:** `@/shared/components/textarea.tsx`

**Props:**
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}
```

**Usage:**
```tsx
import { Textarea } from '@/shared/components'

<Textarea 
  label="Description"
  placeholder="Enter description..."
  rows={4}
  helperText="Maximum 500 characters"
/>
```

**Features:**
- Minimum height of 100px
- Vertical resize only
- Same styling as Input component
- Character count support via helperText

---

### Layout Components

#### Navbar

The main navigation component with authentication state management.

**Location:** `@/shared/components/layout/navbar.tsx`

**Features:**
- Responsive design (mobile hamburger menu)
- Authentication state integration
- User menu dropdown
- Scroll-based styling changes
- Keyboard navigation support
- Click-outside-to-close functionality

**Usage:**
```tsx
import Navbar from '@/shared/components/layout/navbar'

// Used in layout.tsx
<Navbar />
```

**Key Features:**
- Mobile-first responsive design
- Integrates with `useAuth` hook
- Smooth animations and transitions
- Accessibility features (ARIA labels, keyboard navigation)

---

#### Footer

The site footer with links and company information.

**Location:** `@/shared/components/layout/footer.tsx`

**Features:**
- Responsive grid layout
- Service links
- Provider information
- Company links
- Social media integration

---

#### Logo

Reusable logo component used across the application.

**Location:** `@/shared/components/layout/logo.tsx`

---

### Section Components

#### HeroSection

The main hero section for the homepage.

**Location:** `@/shared/components/sections/hero.tsx`

**Features:**
- Responsive design with different layouts for mobile/desktop
- Animated background on desktop
- Search functionality integration
- Call-to-action buttons
- Benefit highlights

**Key Elements:**
- Gradient backgrounds
- Search preview component
- Responsive typography
- Mobile-optimized layout

---

#### FeaturesSection

Displays platform features in a grid layout.

**Location:** `@/shared/components/sections/features.tsx`

**Features:**
- 6 key features with icons
- Responsive grid (1-2-3 columns)
- Lucide React icons
- Hover effects

**Feature List:**
- Real-time location
- Verified reviews
- Transparent pricing
- Instant booking
- Security & safety
- Always accessible

---

#### SearchPreview

Interactive search component with location services.

**Location:** `@/shared/components/search-preview.tsx`

**Features:**
- ZIP code search
- Geolocation integration
- Loading states
- Error handling
- Service count display
- Mobile-responsive design

**Usage:**
```tsx
import SearchPreview from '@/shared/components/search-preview'

<SearchPreview />
```

**Key Functionality:**
- Browser geolocation API
- Form validation
- Loading indicators
- Error messages in French
- Responsive design with `useMobile` hook

---

## Feature Components

### Authentication Components

#### CustomerRegistrationForm

Customer registration form with validation.

**Location:** `@/features/auth/components/customer-registration-form.tsx`

**Features:**
- Form validation
- Password confirmation
- Loading states
- Error handling
- Integration with `useAuth` hook

**Form Fields:**
- First Name
- Last Name
- Email
- Password
- Confirm Password

---

#### ProviderRegistrationForm

Provider registration form with business information.

**Location:** `@/features/auth/components/provider-registration-form.tsx`

**Features:**
- Extended form fields for providers
- Business name field
- Phone number field
- Same validation as customer form

**Additional Fields:**
- Business Name
- Phone Number

---

#### AuthProvider

Context provider for authentication state management.

**Location:** `@/features/auth/components/providers/auth-provider.tsx`

**Context Interface:**
```typescript
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
}
```

---

### Profile Components

#### ProfileHeader

User profile header with avatar and basic information.

**Location:** `@/features/profile/components/profile-header.tsx`

**Features:**
- Profile picture display/upload
- User initials fallback
- Edit functionality
- Responsive design

---

#### EditProfileForm

Form for editing user profile information.

**Location:** `@/features/profile/components/edit-profile-form.tsx`

**Features:**
- Form validation
- Error handling
- Character limits (bio: 500 chars)
- Email format validation
- Phone number validation

**Form Fields:**
- First Name
- Last Name
- Email
- Phone
- Bio

---

#### AccountSettings

Account management and security settings.

**Location:** `@/features/profile/components/account-settings.tsx`

**Features:**
- Quick actions section
- Security overview
- Password change
- Two-factor authentication
- Login activity
- Account actions

---

#### ChangePasswordModal

Modal for changing user password.

**Location:** `@/features/profile/components/change-password-modal.tsx`

**Features:**
- Current password verification
- New password validation
- Password confirmation
- Security requirements
- Modal overlay

---

### Get Started Components

#### GetStartedHero

Hero section for the get-started page.

**Location:** `@/features/get-started/components/hero.tsx`

**Features:**
- Framer Motion animations
- Authentication state awareness
- Step-by-step process display
- Benefits highlighting
- Call-to-action buttons

**Animation Features:**
- Staggered children animations
- Smooth transitions
- Hover effects
- Progressive disclosure

---

#### ProviderSection

Section promoting provider registration.

**Location:** `@/features/get-started/components/provider-section.tsx`

**Features:**
- Provider benefits
- Feature highlights
- Step-by-step process
- Pricing information
- Call-to-action

---

## Custom Hooks

### useMobile

Hook for detecting mobile screen sizes.

**Usage:**
```tsx
import { useMobile } from '@/shared/hooks'

const Component = () => {
  const isMobile = useMobile()
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      Content
    </div>
  )
}
```

### useAuth

Hook for authentication state management.

**Usage:**
```tsx
import { useAuth } from '@/features/auth/hooks/useAuth'

const Component = () => {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginForm />
  }
  
  return <Dashboard user={user} />
}
```

---

## Styling Guidelines

### Tailwind CSS Classes

The project uses Tailwind CSS with a custom configuration:

**Primary Colors:**
- `primary-500`: Main brand color
- `primary-600`: Darker variant
- `primary-700`: Even darker variant

**Common Patterns:**
```css
/* Button base styles */
.btn-base {
  @apply inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none;
}

/* Input base styles */
.input-base {
  @apply w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors;
}
```

### Responsive Design

**Breakpoints:**
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up

**Mobile-First Approach:**
```tsx
// Mobile first, then larger screens
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## Component Testing

### Testing Utilities

Components are tested using:
- **React Testing Library**
- **Jest**
- **@testing-library/jest-dom**

### Example Test Structure

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Component from './component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interaction', () => {
    render(<Component />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    // Assert expected behavior
  })
})
```

---

## Accessibility Guidelines

### ARIA Labels

All interactive elements should have proper ARIA labels:

```tsx
<button aria-label="Edit profile picture">
  <EditIcon />
</button>
```

### Keyboard Navigation

Components support keyboard navigation:
- Tab order
- Enter/Space activation
- Escape to close modals
- Arrow keys for menus

### Screen Reader Support

- Semantic HTML elements
- Proper heading hierarchy
- Alt text for images
- Form labels and descriptions

---

## Performance Considerations

### Code Splitting

Components are lazy-loaded where appropriate:

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />
})
```

### Memoization

Use React.memo for expensive components:

```tsx
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
})
```

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image'

<Image
  src="/profile.jpg"
  alt="Profile picture"
  width={100}
  height={100}
  priority
/>
```

---

## Development Guidelines

### Component Structure

```tsx
// 1. Imports
import React from 'react'
import { ComponentProps } from './types'

// 2. Interface/Types
interface Props extends ComponentProps {
  // Component-specific props
}

// 3. Component
const Component = React.forwardRef<HTMLElement, Props>(
  ({ prop1, prop2, ...props }, ref) => {
    // 4. Hooks and state
    const [state, setState] = useState()
    
    // 5. Event handlers
    const handleClick = () => {
      // Handler logic
    }
    
    // 6. Render
    return (
      <div ref={ref} {...props}>
        {/* JSX */}
      </div>
    )
  }
)

// 7. Display name
Component.displayName = 'Component'

// 8. Export
export default Component
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile`)
- **Files**: kebab-case (`user-profile.tsx`)
- **Props**: camelCase (`isLoading`)
- **CSS Classes**: Tailwind utilities

### Import Patterns

```tsx
// External libraries
import React from 'react'
import Link from 'next/link'

// Internal shared
import { Button } from '@/shared/components'
import { useAuth } from '@/shared/hooks'

// Feature-specific
import { ProfileService } from '../services'
import { ProfileTypes } from '../types'
```

---

## Future Enhancements

### Planned Components

1. **DataTable**: Sortable, filterable table component
2. **Modal**: Reusable modal with animations
3. **Toast**: Notification system
4. **Skeleton**: Loading placeholders
5. **Pagination**: Data pagination component
6. **DatePicker**: Date selection component
7. **FileUpload**: Drag-and-drop file upload
8. **Chart**: Data visualization components

### Component Library

Consider extracting shared components into a separate package for reuse across multiple applications.

---

## Troubleshooting

### Common Issues

1. **Hydration Errors**: Ensure server and client render the same content
2. **CSS Conflicts**: Use Tailwind's utility classes consistently
3. **Performance**: Use React DevTools Profiler to identify bottlenecks
4. **Accessibility**: Test with screen readers and keyboard navigation

### Debug Tools

- React DevTools
- Tailwind CSS IntelliSense
- ESLint with accessibility rules
- Lighthouse for performance audits