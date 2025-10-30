# Library Directory Guidelines

This directory contains reusable code that serves as the foundation for the application. The `/lib` directory follows these organization principles:

## Directory Structure

- `/lib/api`: API clients and related utilities
- `/lib/hooks`: React hooks that can be reused across components
- `/lib/utils`: General utility functions
- `/lib/constants`: Application-wide constants and configuration
- `/lib/styles`: Shared styling utilities and theme definitions
- `/lib/validation`: Form validation schemas and utilities

## Guidelines for `/lib` Usage

### What belongs in `/lib`:

1. **Reusable code** that is used in multiple places throughout the application
2. **Stateless utilities** that perform specific functions without side effects
3. **Configuration and constants** that define application-wide settings
4. **API clients** and data fetching abstractions
5. **Shared hooks** that encapsulate reusable React logic
6. **Validation schemas** and related utilities

### What does NOT belong in `/lib`:

1. **Component-specific logic** that is only used by a single component
2. **Page-specific code** that is only relevant to a specific route
3. **State management** that is specific to a feature (use `/store` instead)
4. **UI components** (use `/components` instead)

## Documentation Standards

All functions, types, and constants in the `/lib` directory should:

1. Include JSDoc comments explaining their purpose and usage
2. Specify parameter types and return types
3. Include examples where appropriate
4. Be properly exported from index files for easy importing

## Import Patterns

When importing from `/lib`, use the following patterns:

```typescript
// Good - Import from the module directly
import { formatDate } from '@/lib/utils/date'

// Good - Import from index if available
import { formatDate } from '@/lib/utils'

// Avoid - Don't use relative imports for lib modules
// import { formatDate } from '../../lib/utils/date'
```

## Testing

All code in the `/lib` directory should have corresponding tests to ensure reliability and prevent regressions.