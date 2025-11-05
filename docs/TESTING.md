# Testing Documentation

## Overview

This document outlines the testing strategy, guidelines, and best practices for the Darigo platform. Our testing approach ensures code quality, reliability, and maintainability across both frontend and backend applications.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Testing Pyramid](#testing-pyramid)
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Configuration](#test-configuration)
- [Testing Best Practices](#testing-best-practices)
- [Continuous Integration](#continuous-integration)
- [Coverage Requirements](#coverage-requirements)
- [Troubleshooting](#troubleshooting)

---

## Testing Strategy

### Goals

1. **Reliability**: Ensure code works as expected
2. **Regression Prevention**: Catch breaking changes early
3. **Documentation**: Tests serve as living documentation
4. **Confidence**: Enable safe refactoring and deployments
5. **Quality**: Maintain high code standards

### Testing Types

1. **Unit Tests**: Test individual functions/components in isolation
2. **Integration Tests**: Test interaction between modules
3. **End-to-End Tests**: Test complete user workflows
4. **Visual Tests**: Test UI components and layouts
5. **Performance Tests**: Test application performance
6. **Security Tests**: Test for security vulnerabilities

---

## Testing Pyramid

```
    /\
   /  \     E2E Tests (Few)
  /____\    - Critical user flows
 /      \   - Cross-browser testing
/________\  
          \  Integration Tests (Some)
           \ - API endpoints
            \- Database operations
             \- Service interactions
              \
               \ Unit Tests (Many)
                \- Pure functions
                 \- Component logic
                  \- Business logic
```

### Distribution

- **70%** Unit Tests
- **20%** Integration Tests
- **10%** End-to-End Tests

---

## Frontend Testing

### Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: End-to-end testing
- **@testing-library/jest-dom**: Custom Jest matchers

### Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './'
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}

module.exports = createJestConfig(customJestConfig)
```

### Component Testing

#### Basic Component Test

```typescript
// button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from './button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies correct variant classes', () => {
    render(<Button variant="primary">Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-500')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is accessible', () => {
    render(<Button aria-label="Submit form">Submit</Button>)
    expect(screen.getByLabelText('Submit form')).toBeInTheDocument()
  })
})
```

#### Form Testing

```typescript
// login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'

// Mock the auth hook
jest.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null
  })
}))

describe('LoginForm', () => {
  const user = userEvent.setup()

  it('renders form fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const mockLogin = jest.fn()
    jest.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    })

    render(<LoginForm />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})
```

#### Hook Testing

```typescript
// use-auth.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './use-auth'

// Mock API calls
jest.mock('@/shared/services/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn()
  }
}))

describe('useAuth Hook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('handles login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    jest.mocked(authApi.login).mockResolvedValue({ user: mockUser, token: 'token' })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles login error', async () => {
    jest.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password')
      } catch (error) {
        expect(error.message).toBe('Invalid credentials')
      }
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

### API Mocking with MSW

```typescript
// mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.json({
          user: { id: '1', email: 'test@example.com', firstName: 'Test' },
          token: 'mock-jwt-token'
        })
      )
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    )
  }),

  // User endpoints
  rest.get('/api/users/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }))
    }
    
    return res(
      ctx.json({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      })
    )
  })
]
```

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```typescript
// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())
```

---

## Backend Testing

### Testing Stack

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory MongoDB for testing
- **@nestjs/testing**: NestJS testing utilities

### Test Configuration

```typescript
// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Unit Testing

#### Service Testing

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserService } from './user.service'
import { User, UserDocument } from './schemas/user.schema'
import { CreateUserDto } from './dto/create-user.dto'

describe('UserService', () => {
  let service: UserService
  let model: Model<UserDocument>

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    save: jest.fn().mockResolvedValue(this)
  }

  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
    model = module.get<Model<UserDocument>>(getModelToken(User.name))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }

      mockUserModel.create.mockResolvedValue(mockUser)

      const result = await service.create(createUserDto)

      expect(result).toEqual(mockUser)
      expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto)
    })

    it('should throw error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }

      mockUserModel.create.mockRejectedValue({ code: 11000 })

      await expect(service.create(createUserDto)).rejects.toThrow()
    })
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser]
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(users)
      })

      const result = await service.findAll()

      expect(result).toEqual(users)
      expect(mockUserModel.find).toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      })

      const result = await service.findById('507f1f77bcf86cd799439011')

      expect(result).toEqual(mockUser)
      expect(mockUserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011')
    })

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(service.findById('nonexistent')).rejects.toThrow('User with ID nonexistent not found')
    })
  })
})
```

#### Controller Testing

```typescript
// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'

describe('UserController', () => {
  let controller: UserController
  let service: UserService

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    }).compile()

    controller = module.get<UserController>(UserController)
    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }

      const expectedResult = { id: '1', ...createUserDto }
      mockUserService.create.mockResolvedValue(expectedResult)

      const result = await controller.create(createUserDto)

      expect(result).toEqual(expectedResult)
      expect(service.create).toHaveBeenCalledWith(createUserDto)
    })
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedResult = [{ id: '1', email: 'test@example.com' }]
      mockUserService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll()

      expect(result).toEqual(expectedResult)
      expect(service.findAll).toHaveBeenCalled()
    })
  })
})
```

### Integration Testing

```typescript
// auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AppModule } from '../src/app.module'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let mongod: MongoMemoryServer

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        AppModule
      ]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await mongod.stop()
  })

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.email).toBe('test@example.com')
          expect(res.body.token).toBeDefined()
        })
    })

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(400)
    })

    it('should return 409 for duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(409)
    })
  })

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          firstName: 'Login',
          lastName: 'User'
        })
    })

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe('login@example.com')
          expect(res.body.token).toBeDefined()
        })
    })

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(401)
    })
  })

  describe('/auth/profile (GET)', () => {
    let authToken: string

    beforeEach(async () => {
      // Register and login to get token
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'profile@example.com',
          password: 'password123',
          firstName: 'Profile',
          lastName: 'User'
        })
      
      authToken = response.body.token
    })

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('profile@example.com')
          expect(res.body.firstName).toBe('Profile')
        })
    })

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401)
    })

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })
})
```

---

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should register a new user', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Get Started')
    await page.click('text=Sign up as Customer')

    // Fill registration form
    await page.fill('[data-testid=firstName]', 'Test')
    await page.fill('[data-testid=lastName]', 'User')
    await page.fill('[data-testid=email]', 'test@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.fill('[data-testid=confirmPassword]', 'password123')

    // Submit form
    await page.click('[data-testid=submit-button]')

    // Verify success
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome, Test')).toBeVisible()
  })

  test('should login existing user', async ({ page }) => {
    // Navigate to login
    await page.click('text=Sign In')

    // Fill login form
    await page.fill('[data-testid=email]', 'existing@example.com')
    await page.fill('[data-testid=password]', 'password123')

    // Submit form
    await page.click('[data-testid=login-button]')

    // Verify success
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid=user-menu]')).toBeVisible()
  })

  test('should show validation errors', async ({ page }) => {
    await page.click('text=Sign In')
    await page.click('[data-testid=login-button]')

    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should logout user', async ({ page }) => {
    // Login first
    await page.click('text=Sign In')
    await page.fill('[data-testid=email]', 'existing@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')

    // Logout
    await page.click('[data-testid=user-menu]')
    await page.click('text=Sign Out')

    // Verify logout
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Sign In')).toBeVisible()
  })
})
```

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should search by zip code', async ({ page }) => {
    await page.goto('/')

    // Enter zip code
    await page.fill('[data-testid=zip-input]', '12345')
    await page.click('[data-testid=search-button]')

    // Verify results
    await expect(page.locator('[data-testid=search-results]')).toBeVisible()
    await expect(page.locator('text=services found')).toBeVisible()
  })

  test('should use geolocation', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 })

    await page.goto('/')

    // Click use location button
    await page.click('[data-testid=use-location-button]')

    // Wait for location to be detected
    await expect(page.locator('[data-testid=location-detected]')).toBeVisible()
    await expect(page.locator('text=New York')).toBeVisible()
  })

  test('should handle search errors', async ({ page }) => {
    await page.goto('/')

    // Enter invalid zip code
    await page.fill('[data-testid=zip-input]', 'invalid')
    await page.click('[data-testid=search-button]')

    // Verify error message
    await expect(page.locator('text=Please enter a valid zip code')).toBeVisible()
  })
})
```

---

## Test Configuration

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:frontend": "jest --config apps/frontend/jest.config.js",
    "test:backend": "jest --config apps/backend/jest.config.js",
    "playwright": "playwright test",
    "playwright:ui": "playwright test --ui",
    "playwright:report": "playwright show-report"
  }
}
```

### Environment Variables for Testing

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=mongodb://localhost:27017/darigo_test
JWT_SECRET=test-jwt-secret
JWT_EXPIRES_IN=1h
```

---

## Testing Best Practices

### General Principles

1. **AAA Pattern**: Arrange, Act, Assert
2. **Single Responsibility**: One test, one behavior
3. **Descriptive Names**: Clear test descriptions
4. **Independent Tests**: No test dependencies
5. **Fast Execution**: Quick feedback loop

### Do's and Don'ts

#### ✅ Do's

- Write tests before or alongside code (TDD/BDD)
- Test behavior, not implementation
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Test edge cases and error conditions
- Maintain test code quality
- Use data-testid attributes for E2E tests

#### ❌ Don'ts

- Test implementation details
- Write overly complex tests
- Ignore failing tests
- Test third-party libraries
- Use production data in tests
- Skip error case testing
- Write tests that depend on each other
- Hardcode test data

### Test Organization

```
src/
├── components/
│   ├── button/
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   └── button.stories.tsx
│   └── form/
│       ├── form.tsx
│       ├── form.test.tsx
│       └── form.stories.tsx
├── hooks/
│   ├── use-auth.ts
│   └── use-auth.test.ts
├── services/
│   ├── api.ts
│   └── api.test.ts
└── utils/
    ├── validation.ts
    └── validation.test.ts
```

### Test Data Management

```typescript
// test/fixtures/users.ts
export const mockUsers = {
  customer: {
    id: '1',
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer'
  },
  provider: {
    id: '2',
    email: 'provider@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'provider'
  },
  admin: {
    id: '3',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  }
}

export const createMockUser = (overrides = {}) => ({
  ...mockUsers.customer,
  ...overrides
})
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Coverage Requirements

### Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
}
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

```typescript
// Increase timeout for slow tests
test('slow operation', async () => {
  // Test code
}, 10000) // 10 second timeout
```

#### 2. MongoDB Connection Issues

```typescript
// Ensure proper cleanup
afterEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

afterAll(async () => {
  await mongoose.connection.close()
})
```

#### 3. React Testing Library Issues

```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Expected text')).toBeInTheDocument()
})

// Use findBy for async elements
const element = await screen.findByText('Async text')
```

#### 4. Mock Issues

```typescript
// Clear mocks between tests
afterEach(() => {
  jest.clearAllMocks()
})

// Reset modules for clean state
beforeEach(() => {
  jest.resetModules()
})
```

### Debugging Tests

```bash
# Debug specific test
npm run test:debug -- --testNamePattern="test name"

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test user.test.ts
```

### Performance Optimization

1. **Parallel Execution**: Use `--maxWorkers` flag
2. **Test Isolation**: Avoid shared state
3. **Mock Heavy Operations**: Database calls, API requests
4. **Selective Testing**: Use `--testPathPattern` for specific tests

---

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### Tools

- **VS Code Extensions**:
  - Jest Runner
  - Playwright Test for VS Code
  - Coverage Gutters

### Best Practices

- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)

---

Remember: Good tests are an investment in code quality, developer confidence, and long-term maintainability. Write tests that provide value and make your codebase more reliable.